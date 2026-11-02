import prisma from '../../config/prisma';
import { runInTransaction } from '../../shared/tx';
import { ApiError } from '../../shared/errors';
import { AuditService } from '../audit/audit.service';
import { getColomboToday } from '../../lib/date';
import { computeTotals } from './totals';
import { CreateQuotationInput, ListQuotationsQuery } from './quotations.schemas';
import { formatQuotation } from './quotations.formatter';
import { findMany, findById } from './quotations.repository';

export interface QuotationServiceContext { ip?: string; requestId?: string; }
type Actor = { userId?: bigint | string; role?: string };

export async function createQuotation(data: CreateQuotationInput, actor?: Actor, ctx?: QuotationServiceContext) {
  let clientId: bigint;
  try { clientId = BigInt(data.clientId); } catch { throw new ApiError(404, 'NOT_FOUND', 'Client not found'); }
  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) throw new ApiError(404, 'NOT_FOUND', 'Client not found');
  if (!client.is_active) throw new ApiError(422, 'CLIENT_INACTIVE', 'Cannot create quotation for an inactive client');

  let leadId: bigint | null = null;
  if (data.leadId) {
    try { leadId = BigInt(data.leadId); } catch { throw new ApiError(404, 'NOT_FOUND', 'Lead not found'); }
    if (!(await prisma.lead.findUnique({ where: { id: leadId } }))) throw new ApiError(404, 'NOT_FOUND', 'Lead not found');
  }

  const totals = computeTotals(data.items, data.tax?.amount ?? 0);
  const creatorId = actor?.userId ? BigInt(actor.userId) : BigInt(1);

  return runInTransaction(async (tx) => {
    const q = await tx.quotation.create({
      data: {
        quotationNumber: `TMP-${Date.now()}-${Math.floor(Math.random() * 100)}`,
        clientId, leadId, title: data.title, status: 'DRAFT', quotationDate: getColomboToday(),
        validUntil: data.validUntil, subtotal: totals.subtotal, taxType: data.tax?.type ?? 'NONE',
        taxRate: data.tax?.rate ?? 0, taxAmount: totals.taxAmount, taxReference: data.tax?.reference ?? null,
        total: totals.total, notes: data.notes ?? null, createdBy: creatorId,
      },
    });

    await tx.quotationItem.createMany({
      data: data.items.map((item, idx) => ({
        quotationId: q.id, lineNo: idx + 1, description: item.description,
        quantity: totals.lines[idx].quantity, unitPrice: totals.lines[idx].unitPrice,
        lineAmount: totals.lines[idx].lineAmount,
      })),
    });

    const num = `QT-${new Date().getFullYear()}-${String(q.id).padStart(4, '0')}`;
    const updated = await tx.quotation.update({ where: { id: q.id }, data: { quotationNumber: num }, include: { items: true } });
    const formatted = formatQuotation(updated);
    await AuditService.record(tx, { actor, action: 'QUOTATION_CREATED', entityType: 'QUOTATION', entityId: q.id, after: formatted, ip: ctx?.ip, requestId: ctx?.requestId });
    return formatted;
  });
}

export async function getQuotations(query: ListQuotationsQuery, actor?: Actor) {
  const createdBy = actor?.role === 'STAFF' && actor.userId ? BigInt(actor.userId) : query.createdBy ? BigInt(query.createdBy) : undefined;
  const status = query.pendingApproval ? 'PENDING_APPROVAL' : query.status;
  let clientId: bigint | undefined;
  if (query.clientId) { try { clientId = BigInt(query.clientId); } catch {} }

  const page = query.page ?? 1, pageSize = query.pageSize ?? 20;
  const [items, total] = await findMany({ status, clientId, createdBy, search: query.search?.trim() }, { skip: (page - 1) * pageSize, take: pageSize });
  return { data: items.map(formatQuotation), meta: { page, pageSize, total } };
}

export async function getQuotationById(id: string, actor?: Actor) {
  let rawId: bigint;
  try { rawId = BigInt(id); } catch { throw new ApiError(404, 'NOT_FOUND', 'Quotation not found'); }
  const quotation = await findById(rawId);
  if (!quotation) throw new ApiError(404, 'NOT_FOUND', 'Quotation not found');
  if (actor?.role === 'STAFF' && quotation.createdBy.toString() !== actor.userId?.toString()) {
    throw new ApiError(403, 'FORBIDDEN', 'Access denied to this quotation');
  }
  return formatQuotation(quotation);
}

export const QuotationsService = { createQuotation, getQuotations, getQuotationById };
export default QuotationsService;
