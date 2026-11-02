import { runInTransaction } from '../../shared/tx';
import { ApiError } from '../../shared/errors';
import { AuditService } from '../audit/audit.service';
import { isExpiredQuotation, isBefore } from '../../shared/dates';
import { getColomboToday } from '../../lib/date';
import { formatQuotation } from './quotations.formatter';
import { findById, userInclude } from './quotations.repository';
import { RespondQuotationInput } from './quotations.schemas';

export interface QuotationLifecycleContext { ip?: string; requestId?: string; }
type Actor = { userId?: bigint | string; role?: string };

export async function sendQuotation(id: string, actor?: Actor, ctx?: QuotationLifecycleContext) {
  let rawId: bigint;
  try { rawId = BigInt(id); } catch { throw new ApiError(404, 'NOT_FOUND', 'Quotation not found'); }
  const quotation = await findById(rawId);
  if (!quotation) throw new ApiError(404, 'NOT_FOUND', 'Quotation not found');

  if (quotation.status !== 'APPROVED') {
    throw new ApiError(409, 'INVALID_STATE_TRANSITION', 'Only APPROVED quotations can be sent');
  }
  if (isBefore(quotation.validUntil, getColomboToday())) {
    throw new ApiError(409, 'QUOTATION_EXPIRED', 'Cannot send an expired quotation');
  }

  return runInTransaction(async (tx) => {
    const updated = await tx.quotation.update({
      where: { id: rawId },
      data: { status: 'SENT', sentAt: new Date() },
      include: { items: { orderBy: { lineNo: 'asc' } }, creator: userInclude, approver: userInclude },
    });
    const formatted = formatQuotation(updated);
    await AuditService.record(tx, {
      actor, action: 'QUOTATION_SENT', entityType: 'QUOTATION', entityId: rawId,
      before: formatQuotation(quotation), after: formatted, ip: ctx?.ip, requestId: ctx?.requestId,
    });
    return formatted;
  });
}

export async function respondQuotation(id: string, data: RespondQuotationInput, actor?: Actor, ctx?: QuotationLifecycleContext) {
  let rawId: bigint;
  try { rawId = BigInt(id); } catch { throw new ApiError(404, 'NOT_FOUND', 'Quotation not found'); }
  const quotation = await findById(rawId);
  if (!quotation) throw new ApiError(404, 'NOT_FOUND', 'Quotation not found');

  if (quotation.status !== 'SENT') {
    throw new ApiError(409, 'INVALID_STATE_TRANSITION', 'Only SENT quotations can receive a client response');
  }
  if (isExpiredQuotation(quotation) && data.outcome === 'ACCEPTED') {
    throw new ApiError(409, 'QUOTATION_EXPIRED', 'Cannot accept an expired quotation');
  }

  return runInTransaction(async (tx) => {
    const updated = await tx.quotation.update({
      where: { id: rawId },
      data: { status: data.outcome, respondedAt: new Date(data.date), responseNote: data.note ?? null },
      include: { items: { orderBy: { lineNo: 'asc' } }, creator: userInclude, approver: userInclude },
    });
    const formatted = formatQuotation(updated);
    await AuditService.record(tx, {
      actor, action: 'QUOTATION_RESPONDED', entityType: 'QUOTATION', entityId: rawId,
      before: formatQuotation(quotation), after: formatted, ip: ctx?.ip, requestId: ctx?.requestId,
    });
    return formatted;
  });
}
