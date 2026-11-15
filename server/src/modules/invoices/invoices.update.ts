import { Prisma } from '../../generated/prisma';
import Decimal from 'decimal.js';
import { runInTransaction } from '../../shared/tx';
import { ApiError } from '../../shared/errors';
import { AuditService } from '../audit/audit.service';
import { UpdateInvoiceInput } from './invoices.schemas';
import { formatInvoice } from './invoices.formatter';
import { calculateSubtotal, calculateTotal } from './totals';
import { assertEditable } from './invoices.guard';
import { Actor, InvoiceServiceContext } from './invoices.create';

export async function updateInvoice(
  id: string | bigint | number,
  data: UpdateInvoiceInput,
  actor?: Actor,
  ctx?: InvoiceServiceContext
) {
  let invoiceId: bigint;
  try {
    invoiceId = BigInt(id);
  } catch {
    throw new ApiError(404, 'NOT_FOUND', 'Invoice not found');
  }

  return runInTransaction(async (tx) => {
    const existing = await tx.invoice.findUnique({
      where: { id: invoiceId },
      include: { items: true },
    });
    if (!existing) throw new ApiError(404, 'NOT_FOUND', 'Invoice not found');
    assertEditable(existing);

    const subtotal = data.items
      ? new Prisma.Decimal(calculateSubtotal(data.items))
      : existing.subtotal;
    const taxAmount =
      data.taxAmount !== undefined
        ? new Prisma.Decimal(String(data.taxAmount))
        : existing.taxAmount;
    const total = new Prisma.Decimal(calculateTotal(subtotal.toString(), taxAmount.toString()));
    const taxRate =
      data.taxRate !== undefined
        ? data.taxRate != null
          ? new Prisma.Decimal(data.taxRate.toString())
          : null
        : existing.taxRate;

    if (data.items) {
      await tx.invoiceItem.deleteMany({ where: { invoiceId } });
      const newItems = data.items.map((it: any, idx: number) => ({
        invoiceId,
        lineNo: idx + 1,
        description: it.description,
        quantity: new Prisma.Decimal(new Decimal(it.quantity ?? 1).toFixed(2)),
        unitPrice: new Prisma.Decimal(new Decimal(it.amount).toFixed(2)),
        lineAmount: new Prisma.Decimal(new Decimal(it.amount).times(it.quantity ?? 1).toFixed(2)),
      }));
      if (newItems.length > 0) await tx.invoiceItem.createMany({ data: newItems });
    }

    const updated = await tx.invoice.update({
      where: { id: invoiceId },
      data: {
        subtotal,
        total,
        taxType: data.taxType !== undefined ? data.taxType : existing.taxType,
        taxRate,
        taxAmount,
        taxReference: data.taxReference !== undefined ? data.taxReference : existing.taxReference,
        notes: data.notes !== undefined ? data.notes : existing.notes,
        dueDate:
          data.dueDate !== undefined
            ? data.dueDate
              ? new Date(data.dueDate)
              : null
            : existing.dueDate,
      },
      include: { items: true },
    });

    const formatted = formatInvoice(updated);
    await AuditService.record(tx, {
      actor,
      action: 'INVOICE_UPDATED',
      entityType: 'INVOICE',
      entityId: invoiceId,
      before: formatInvoice(existing),
      after: formatted,
      ip: ctx?.ip,
      requestId: ctx?.requestId,
    });
    return formatted;
  });
}
