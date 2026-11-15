import { runInTransaction } from '../../shared/tx';
import { ApiError } from '../../shared/errors';
import { AuditService } from '../audit/audit.service';
import { assertTransition, quotationMachine, Role } from '../../shared/state';
import { formatQuotation } from './quotations.formatter';
import { findById } from './quotations.repository';

export interface QuotationWorkflowContext {
  ip?: string;
  requestId?: string;
}
type Actor = { userId?: bigint | string; role?: string };

export async function submitQuotation(id: string, actor?: Actor, ctx?: QuotationWorkflowContext) {
  let rawId: bigint;
  try {
    rawId = BigInt(id);
  } catch {
    throw new ApiError(404, 'NOT_FOUND', 'Quotation not found');
  }
  const quotation = await findById(rawId);
  if (!quotation) throw new ApiError(404, 'NOT_FOUND', 'Quotation not found');
  if (actor?.role === 'STAFF' && quotation.createdBy.toString() !== actor.userId?.toString()) {
    throw new ApiError(403, 'FORBIDDEN', 'Access denied to this quotation');
  }

  assertTransition(quotationMachine, quotation.status, 'PENDING_APPROVAL', actor?.role as Role);

  if (!quotation.items || quotation.items.length === 0 || Number(quotation.total) <= 0) {
    throw new ApiError(
      422,
      'VALIDATION_ERROR',
      'Quotation must have at least one item and total greater than 0'
    );
  }

  return runInTransaction(async (tx) => {
    const updated = await tx.quotation.update({
      where: { id: rawId },
      data: { status: 'PENDING_APPROVAL', submittedAt: new Date() },
      include: {
        items: true,
        creator: { select: { id: true, email: true, employee: { select: { full_name: true } } } },
        approver: { select: { id: true, email: true, employee: { select: { full_name: true } } } },
      },
    });
    const formatted = formatQuotation(updated);
    await AuditService.record(tx, {
      actor,
      action: 'QUOTATION_SUBMITTED',
      entityType: 'QUOTATION',
      entityId: rawId,
      before: formatQuotation(quotation),
      after: formatted,
      ip: ctx?.ip,
      requestId: ctx?.requestId,
    });
    return formatted;
  });
}

export const QuotationsWorkflow = { submitQuotation };
export default QuotationsWorkflow;
