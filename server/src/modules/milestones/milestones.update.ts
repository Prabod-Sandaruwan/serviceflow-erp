import prisma from '../../config/prisma';
import { ApiError } from '../../shared/errors';
import { AuditService } from '../audit/audit.service';
import { assertTransition, milestoneMachine } from '../../shared/state';
import { UpdateMilestoneInput } from './milestones.schemas';
import { formatMilestone } from './milestones.formatter';
import { hasNonCancelledInvoices, findMilestoneById } from './milestones.repository';

type Actor = { userId?: bigint | string; role?: string; employeeId?: bigint | string | null };
export interface MilestoneContext { ip?: string; requestId?: string; }

export async function updateMilestone(
  id: string,
  data: UpdateMilestoneInput,
  actor?: Actor,
  ctx?: MilestoneContext
) {
  let rawId: bigint;
  try {
    rawId = BigInt(id);
  } catch {
    throw new ApiError(404, 'NOT_FOUND', 'Milestone not found');
  }

  const milestone = await findMilestoneById(rawId);
  if (!milestone) throw new ApiError(404, 'NOT_FOUND', 'Milestone not found');
  if (milestone.project.status === 'CANCELLED') {
    throw new ApiError(409, 'PROJECT_CANCELLED', 'Cannot edit milestones on a cancelled project');
  }

  if (data.status && data.status !== milestone.status) {
    assertTransition(milestoneMachine, milestone.status as any, data.status as any, actor?.role as any);
  }

  if (data.status === 'CANCELLED') {
    const hasInvoices = await hasNonCancelledInvoices(rawId);
    if (hasInvoices) {
      throw new ApiError(409, 'MILESTONE_HAS_INVOICES', 'Cannot cancel milestone with non-cancelled invoices');
    }
  }

  const updateData: any = {};
  if (data.title || data.name) updateData.name = data.name || data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
  if (data.billingAmount !== undefined) updateData.billingAmount = String(data.billingAmount);
  if (data.status !== undefined) {
    updateData.status = data.status;
    if (data.status === 'COMPLETED' && !milestone.completedAt) updateData.completedAt = new Date();
  }

  const updated = await prisma.milestone.update({ where: { id: rawId }, data: updateData });
  const formatted = formatMilestone(updated);

  await AuditService.record(prisma, {
    actor,
    action: data.status && data.status !== milestone.status ? 'MILESTONE_STATUS_CHANGED' : 'MILESTONE_UPDATED',
    entityType: 'MILESTONE',
    entityId: rawId,
    before: formatMilestone(milestone),
    after: formatted,
    ip: ctx?.ip,
    requestId: ctx?.requestId,
  });
  return formatted;
}
