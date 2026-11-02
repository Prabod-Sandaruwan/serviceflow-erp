import prisma from '../../config/prisma';
import { runInTransaction } from '../../shared/tx';
import { ApiError } from '../../shared/errors';
import { AuditService } from '../audit/audit.service';
import { getColomboToday } from '../../lib/date';
import { computeTotals } from './totals';
import { CreateQuotationInput } from './quotations.schemas';
import { formatQuotation } from './quotations.formatter';

export interface QuotationServiceContext {
  ip?: string;
  requestId?: string;
}

export async function createQuotation(
  data: CreateQuotationInput,
  actor?: { userId?: bigint | string; role?: string },
  ctx?: QuotationServiceContext
) {
  let clientId: bigint;
  try { clientId = BigInt(data.clientId); } catch { throw new ApiError(404, 'NOT_FOUND', 'Client not found'); }

  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) throw new ApiError(404, 'NOT_FOUND', 'Client not found');
  if (!client.is_active) throw new ApiError(422, 'CLIENT_INACTIVE', 'Cannot create quotation for an inactive client');

  let leadId: bigint | null = null;
  if (data.leadId) {
    try { leadId = BigInt(data.leadId); } catch { throw new ApiError(404, 'NOT_FOUND', 'Lead not found'); }
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) throw new ApiError(404, 'NOT_FOUND', 'Lead not found');
  }

  const totals = computeTotals(data.items, data.tax?.amount ?? 0);
  const creatorId = actor?.userId ? BigInt(actor.userId) : BigInt(1);

  return runInTransaction(async (tx) => {
    const quotation = await tx.quotation.create({
      data: {
        quotationNumber: `TMP-${Date.now()}-${Math.floor(Math.random() * 100)}`,
        clientId, leadId, title: data.title, status: 'DRAFT',
        quotationDate: getColomboToday(), validUntil: data.validUntil,
        subtotal: totals.subtotal, taxType: data.tax?.type ?? 'NONE',
        taxRate: data.tax?.rate ?? 0, taxAmount: totals.taxAmount,
        taxReference: data.tax?.reference ?? null, total: totals.total,
        notes: data.notes ?? null, createdBy: creatorId,
      },
    });

    await tx.quotationItem.createMany({
      data: data.items.map((item, idx) => ({
        quotationId: quotation.id, lineNo: idx + 1, description: item.description,
        quantity: totals.lines[idx].quantity, unitPrice: totals.lines[idx].unitPrice,
        lineAmount: totals.lines[idx].lineAmount,
      })),
    });

    const num = `QT-${new Date().getFullYear()}-${String(quotation.id).padStart(4, '0')}`;
    const updated = await tx.quotation.update({
      where: { id: quotation.id },
      data: { quotationNumber: num },
      include: { items: true },
    });

    const formatted = formatQuotation(updated);
    await AuditService.record(tx, {
      actor, action: 'QUOTATION_CREATED', entityType: 'QUOTATION',
      entityId: quotation.id, after: formatted, ip: ctx?.ip, requestId: ctx?.requestId,
    });

    return formatted;
  });
}

export const QuotationsService = { createQuotation };
export default QuotationsService;
