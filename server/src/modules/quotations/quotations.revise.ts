import { runInTransaction } from '../../shared/tx';
import { ApiError } from '../../shared/errors';
import { AuditService } from '../audit/audit.service';
import { isExpiredQuotation } from '../../shared/dates';
import { getColomboToday } from '../../lib/date';
import { formatQuotation } from './quotations.formatter';
import { findById, userInclude } from './quotations.repository';

export interface QuotationReviseContext {
  ip?: string;
  requestId?: string;
}
type Actor = { userId?: bigint | string; role?: string };

export async function reviseQuotation(id: string, actor?: Actor, ctx?: QuotationReviseContext) {
  let rawId: bigint;
  try {
    rawId = BigInt(id);
  } catch {
    throw new ApiError(404, 'NOT_FOUND', 'Quotation not found');
  }
  const quotation = await findById(rawId);
  if (!quotation) throw new ApiError(404, 'NOT_FOUND', 'Quotation not found');

  if (quotation.status === 'REJECTED') {
    return runInTransaction(async (tx) => {
      const updated = await tx.quotation.update({
        where: { id: rawId },
        data: { status: 'DRAFT', rejectionReason: null, approvedBy: null, decidedAt: null },
        include: {
          items: { orderBy: { lineNo: 'asc' } },
          creator: userInclude,
          approver: userInclude,
        },
      });
      const formatted = formatQuotation(updated);
      await AuditService.record(tx, {
        actor,
        action: 'QUOTATION_UPDATED',
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

  if (quotation.status === 'DECLINED' || isExpiredQuotation(quotation)) {
    const todayDate = getColomboToday();
    const validUntil =
      quotation.validUntil >= todayDate
        ? quotation.validUntil
        : new Date(todayDate.getTime() + 30 * 86400000);

    return runInTransaction(async (tx) => {
      const newQ = await tx.quotation.create({
        data: {
          quotationNumber: `TMP-${Date.now()}-${Math.floor(Math.random() * 100)}`,
          clientId: quotation.clientId,
          leadId: quotation.leadId,
          revisionOfId: quotation.id,
          title: quotation.title,
          status: 'DRAFT',
          quotationDate: todayDate,
          validUntil,
          subtotal: quotation.subtotal,
          taxType: quotation.taxType,
          taxRate: quotation.taxRate,
          taxAmount: quotation.taxAmount,
          taxReference: quotation.taxReference,
          total: quotation.total,
          notes: quotation.notes,
          createdBy: actor?.userId ? BigInt(actor.userId) : quotation.createdBy,
        },
      });

      if (quotation.items && quotation.items.length > 0) {
        await tx.quotationItem.createMany({
          data: quotation.items.map((it) => ({
            quotationId: newQ.id,
            lineNo: it.lineNo,
            description: it.description,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            lineAmount: it.lineAmount,
          })),
        });
      }

      const num = `QT-${new Date().getFullYear()}-${String(newQ.id).padStart(4, '0')}`;
      const updated = await tx.quotation.update({
        where: { id: newQ.id },
        data: { quotationNumber: num },
        include: {
          items: { orderBy: { lineNo: 'asc' } },
          creator: userInclude,
          approver: userInclude,
        },
      });
      const formatted = formatQuotation(updated);
      await AuditService.record(tx, {
        actor,
        action: 'QUOTATION_CREATED',
        entityType: 'QUOTATION',
        entityId: newQ.id,
        after: formatted,
        ip: ctx?.ip,
        requestId: ctx?.requestId,
      });
      return formatted;
    });
  }

  throw new ApiError(
    409,
    'INVALID_STATE_TRANSITION',
    'Quotation cannot be revised in current state'
  );
}
