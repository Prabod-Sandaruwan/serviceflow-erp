import { runInTransaction } from '../../shared/tx';
import { ApiError } from '../../shared/errors';
import { AuditService } from '../audit/audit.service';
import { formatQuotation } from './quotations.formatter';
import { userInclude } from './quotations.repository';

export interface QuotationDecisionContext {
  ip?: string;
  requestId?: string;
}
type Actor = { userId?: bigint | string; role?: string };

async function decideQuotation(
  id: string,
  decision: 'APPROVED' | 'REJECTED',
  reason?: string,
  actor?: Actor,
  ctx?: QuotationDecisionContext
) {
  let rawId: bigint;
  try {
    rawId = BigInt(id);
  } catch {
    throw new ApiError(404, 'NOT_FOUND', 'Quotation not found');
  }

  return runInTransaction(async (tx) => {
    const rows = await tx.$queryRaw<{ id: bigint; status: string; created_by: bigint }[]>`
      SELECT id, status, created_by FROM quotations WHERE id = ${rawId} FOR UPDATE
    `;
    if (!rows || rows.length === 0) {
      throw new ApiError(404, 'NOT_FOUND', 'Quotation not found');
    }
    const quotation = rows[0];
    if (quotation.status !== 'PENDING_APPROVAL') {
      throw new ApiError(409, 'INVALID_STATE_TRANSITION', 'Quotation is not pending approval');
    }
    if (quotation.created_by.toString() === actor?.userId?.toString()) {
      throw new ApiError(
        403,
        'SELF_APPROVAL_FORBIDDEN',
        'Submitter cannot approve or reject their own quotation'
      );
    }

    const updated = await tx.quotation.update({
      where: { id: rawId },
      data: {
        status: decision,
        approvedBy: actor?.userId ? BigInt(actor.userId) : null,
        decidedAt: new Date(),
        ...(decision === 'REJECTED' ? { rejectionReason: reason } : {}),
      },
      include: {
        items: true,
        creator: userInclude,
        approver: userInclude,
      },
    });

    const formatted = formatQuotation(updated);
    await AuditService.record(tx, {
      actor,
      action: decision === 'APPROVED' ? 'QUOTATION_APPROVED' : 'QUOTATION_REJECTED',
      entityType: 'QUOTATION',
      entityId: rawId,
      after: formatted,
      ip: ctx?.ip,
      requestId: ctx?.requestId,
    });
    return formatted;
  });
}

export async function approveQuotation(id: string, actor?: Actor, ctx?: QuotationDecisionContext) {
  return decideQuotation(id, 'APPROVED', undefined, actor, ctx);
}

export async function rejectQuotation(
  id: string,
  reason: string,
  actor?: Actor,
  ctx?: QuotationDecisionContext
) {
  return decideQuotation(id, 'REJECTED', reason, actor, ctx);
}
