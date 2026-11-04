import { Prisma } from '../../generated/prisma';
import Decimal from 'decimal.js';
import { runInTransaction } from '../../shared/tx';
import { ApiError } from '../../shared/errors';
import { AuditService } from '../audit/audit.service';
import { CreateInvoiceInput } from './invoices.schemas';
import { formatInvoice } from './invoices.formatter';
import { calculateSubtotal, calculateTotal } from './totals';

export interface InvoiceServiceContext { ip?: string; requestId?: string; }
type Actor = { userId?: bigint | string; role?: string };

export async function createInvoice(data: CreateInvoiceInput, actor?: Actor, ctx?: InvoiceServiceContext) {
  let rawMilestoneId: bigint;
  try { rawMilestoneId = BigInt(data.milestoneId); } catch { throw new ApiError(404, 'NOT_FOUND', 'Milestone not found'); }
  const creatorId = actor?.userId ? BigInt(actor.userId) : BigInt(1);

  return runInTransaction(async (tx) => {
    const rows = await tx.$queryRaw<any[]>`
      SELECT m.id, m.status, m.name, m.name as title, m.billing_amount, m.project_id, p.status as project_status
      FROM milestones m JOIN projects p ON m.project_id = p.id WHERE m.id = ${rawMilestoneId} FOR UPDATE
    `;
    const m = rows?.[0];
    if (!m) throw new ApiError(404, 'NOT_FOUND', 'Milestone not found');
    if (m.project_status === 'CANCELLED') throw new ApiError(409, 'PROJECT_CANCELLED', 'Cannot invoice a cancelled project');
    if (m.status !== 'APPROVED') throw new ApiError(409, 'MILESTONE_NOT_APPROVED', 'Milestone must be approved to create an invoice');

    const existingActive = await tx.invoice.findFirst({ where: { milestoneId: rawMilestoneId, status: { not: 'CANCELLED' } } });
    if (existingActive) throw new ApiError(409, 'INVOICE_ALREADY_EXISTS', 'An active invoice already exists for this milestone');

    const itemsRaw = (data.items && data.items.length > 0)
      ? data.items
      : [{ description: m.title || m.name, amount: m.billing_amount.toString() }];

    const subtotalStr = calculateSubtotal(itemsRaw);
    const taxAmountStr = data.taxAmount ? String(data.taxAmount) : '0';
    const totalStr = calculateTotal(subtotalStr, taxAmountStr);

    const subtotal = new Prisma.Decimal(subtotalStr);
    const taxAmount = new Prisma.Decimal(taxAmountStr);
    const total = new Prisma.Decimal(totalStr);
    const taxRate = data.taxRate !== undefined && data.taxRate !== null ? new Prisma.Decimal(data.taxRate.toString()) : null;

    const itemsToCreate = itemsRaw.map((it: any, idx: number) => {
      const qty = new Decimal(it.quantity ?? 1);
      const unitPrice = new Decimal(it.amount);
      const lineAmount = unitPrice.times(qty);
      return {
        lineNo: idx + 1,
        description: it.description,
        quantity: new Prisma.Decimal(qty.toFixed(2)),
        unitPrice: new Prisma.Decimal(unitPrice.toFixed(2)),
        lineAmount: new Prisma.Decimal(lineAmount.toFixed(2)),
      };
    });

    let invoice: any;
    try {
      invoice = await tx.invoice.create({
        data: {
          invoiceNumber: `TMP-${Math.random().toString(36).slice(2, 10)}`,
          projectId: m.project_id, milestoneId: m.id, activeMilestoneKey: m.id,
          subtotal, taxType: data.taxType ?? null, taxRate, taxAmount,
          taxReference: data.taxReference ?? null, total,
          notes: data.notes ?? null, dueDate: data.dueDate ? new Date(data.dueDate) : null,
          status: 'DRAFT', createdBy: creatorId,
          items: { create: itemsToCreate },
        },
      });
    } catch (err: any) {
      if (err?.code === 'P2002') throw new ApiError(409, 'INVOICE_ALREADY_EXISTS', 'An active invoice already exists for this milestone');
      throw err;
    }

    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invoice.id).padStart(4, '0')}`;
    const updated = await tx.invoice.update({ where: { id: invoice.id }, data: { invoiceNumber }, include: { items: true } });
    const formatted = formatInvoice(updated);

    await AuditService.record(tx, {
      actor, action: 'INVOICE_CREATED', entityType: 'INVOICE',
      entityId: invoice.id, after: formatted, ip: ctx?.ip, requestId: ctx?.requestId,
    });
    return formatted;
  });
}
