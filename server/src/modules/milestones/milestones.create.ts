import prisma from '../../config/prisma';
import { ApiError } from '../../shared/errors';
import { AuditService } from '../audit/audit.service';
import { CreateMilestoneInput } from './milestones.schemas';
import { formatMilestone } from './milestones.formatter';

type Actor = { userId?: bigint | string; role?: string; employeeId?: bigint | string | null };
export interface MilestoneContext { ip?: string; requestId?: string; }

export async function createMilestone(
  projectId: string,
  data: CreateMilestoneInput,
  actor?: Actor,
  ctx?: MilestoneContext
) {
  let rawProjectId: bigint;
  try {
    rawProjectId = BigInt(projectId);
  } catch {
    throw new ApiError(404, 'NOT_FOUND', 'Project not found');
  }

  const project = await prisma.project.findUnique({ where: { id: rawProjectId } });
  if (!project) throw new ApiError(404, 'NOT_FOUND', 'Project not found');
  if (project.status === 'CANCELLED') {
    throw new ApiError(409, 'PROJECT_CANCELLED', 'Cannot add milestones to a cancelled project');
  }

  const title = (data.name || data.title)!;
  const count = await prisma.milestone.count({ where: { projectId: rawProjectId } });

  const milestone = await prisma.milestone.create({
    data: {
      projectId: rawProjectId,
      name: title,
      description: data.description ?? null,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      billingAmount: data.billingAmount ? String(data.billingAmount) : '0',
      status: 'PENDING',
      sortOrder: count + 1,
    },
  });

  const formatted = formatMilestone(milestone);
  await AuditService.record(prisma, {
    actor,
    action: 'MILESTONE_CREATED',
    entityType: 'MILESTONE',
    entityId: milestone.id,
    after: formatted,
    ip: ctx?.ip,
    requestId: ctx?.requestId,
  });
  return formatted;
}
