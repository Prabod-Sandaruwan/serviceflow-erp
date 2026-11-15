import { runInTransaction } from '../../shared/tx';
import { ApiError } from '../../shared/errors';
import { AuditService } from '../audit/audit.service';
import { formatMilestone } from './milestones.formatter';
import { findMilestoneById } from './milestones.repository';

type Actor = { userId?: bigint | string; role?: string; employeeId?: bigint | string | null };
export interface MilestoneContext {
  ip?: string;
  requestId?: string;
}

export async function approveMilestone(id: string, actor?: Actor, ctx?: MilestoneContext) {
  let rawId: bigint;
  try {
    rawId = BigInt(id);
  } catch {
    throw new ApiError(404, 'NOT_FOUND', 'Milestone not found');
  }

  const milestone = await findMilestoneById(rawId);
  if (!milestone) {
    throw new ApiError(404, 'NOT_FOUND', 'Milestone not found');
  }

  if (milestone.project.status === 'CANCELLED') {
    throw new ApiError(409, 'PROJECT_CANCELLED', 'Cannot approve milestone on a cancelled project');
  }

  if (milestone.status !== 'COMPLETED') {
    throw new ApiError(
      409,
      'INVALID_STATE_TRANSITION',
      'Only COMPLETED milestones can be approved'
    );
  }

  const approverId = actor?.userId ? BigInt(actor.userId) : null;
  const approvedAt = new Date();

  return runInTransaction(async (tx) => {
    const updated = await tx.milestone.update({
      where: { id: rawId },
      data: {
        status: 'APPROVED',
        approvedBy: approverId,
        approvedAt,
      },
    });

    const formatted = formatMilestone(updated);
    await AuditService.record(tx, {
      actor,
      action: 'MILESTONE_APPROVED',
      entityType: 'MILESTONE',
      entityId: rawId,
      before: formatMilestone(milestone),
      after: formatted,
      ip: ctx?.ip,
      requestId: ctx?.requestId,
    });

    return formatted;
  });
}
