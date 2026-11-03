import { runInTransaction } from '../../shared/tx';
import { ApiError } from '../../shared/errors';
import { AuditService } from '../audit/audit.service';
import { assertTransition, projectMachine } from '../../shared/state';
import { UpdateProjectInput } from './projects.schemas';
import { formatProject } from './projects.formatter';
import { findById } from './projects.repository';

export interface ProjectServiceContext {
  ip?: string;
  requestId?: string;
}

type Actor = { userId?: bigint | string; role?: string; employeeId?: bigint | string | null };

export async function updateProject(
  id: string,
  data: UpdateProjectInput,
  actor?: Actor,
  ctx?: ProjectServiceContext
) {
  let rawId: bigint;
  try {
    rawId = BigInt(id);
  } catch {
    throw new ApiError(404, 'NOT_FOUND', 'Project not found');
  }

  const project = await findById(rawId);
  if (!project) {
    throw new ApiError(404, 'NOT_FOUND', 'Project not found');
  }

  if (data.status && data.status !== project.status) {
    assertTransition(projectMachine, project.status as any, data.status as any, actor?.role as any);
  }

  if (data.status === 'COMPLETED') {
    const openMilestones = (project.milestones || []).some(
      (m: any) => m.status !== 'CANCELLED' && m.status !== 'APPROVED'
    );
    const openTasks = (project.tasks || []).some(
      (t: any) => t.status !== 'CANCELLED' && t.status !== 'DONE'
    );
    if (openMilestones || openTasks) {
      throw new ApiError(409, 'PROJECT_HAS_OPEN_WORK', 'Cannot complete project with open milestones or tasks');
    }
  }

  const newStart = data.startDate !== undefined ? (data.startDate ? new Date(data.startDate) : null) : project.startDate;
  const newEnd = data.endDate !== undefined ? (data.endDate ? new Date(data.endDate) : null) : project.endDate;
  if (newStart && newEnd && newEnd < newStart) {
    throw new ApiError(422, 'VALIDATION_ERROR', 'End date must not precede start date');
  }

  const updateData: any = {};
  if (data.status !== undefined) updateData.status = data.status;
  if (data.reason !== undefined) updateData.cancelReason = data.reason;
  if (data.startDate !== undefined) updateData.startDate = data.startDate ? new Date(data.startDate) : null;
  if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null;

  return runInTransaction(async (tx) => {
    const updated = await tx.project.update({
      where: { id: rawId },
      data: updateData,
      include: {
        client: { select: { id: true, display_name: true } },
        quotation: { select: { id: true, quotationNumber: true } },
        milestones: { orderBy: { sortOrder: 'asc' } },
        tasks: { orderBy: { createdAt: 'asc' } },
      },
    });

    const formatted = formatProject(updated);
    await AuditService.record(tx, {
      actor,
      action: data.status && data.status !== project.status ? 'PROJECT_STATUS_CHANGED' : 'PROJECT_UPDATED',
      entityType: 'PROJECT',
      entityId: rawId,
      before: formatProject(project),
      after: formatted,
      ip: ctx?.ip,
      requestId: ctx?.requestId,
    });

    return formatted;
  });
}
