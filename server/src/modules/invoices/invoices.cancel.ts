import { runInTransaction } from '../../shared/tx';
import { ApiError } from '../../shared/errors';
import { AuditService } from '../audit/audit.service';
import { CancelInvoiceInput } from './invoices.schemas';
import { formatInvoice } from './invoices.formatter';
import { Actor, InvoiceServiceContext } from './invoices.create';

export async function cancelInvoice(
  id: string | bigint | number,
  data: CancelInvoiceInput,
  actor?: Actor,
  ctx?: InvoiceServiceContext
) {
  let invoiceId: bigint;
  try { invoiceId = BigInt(id); } catch { throw new ApiError(404, 'NOT_FOUND', 'Invoice not found'); }

  return runInTransaction(async (tx) => {
    const rows = await tx.$queryRaw<any[]>`
      SELECT * FROM invoices WHERE id = ${invoiceId} FOR UPDATE
    `;
    const inv = rows?.[0];
    if (!inv) throw new ApiError(404, 'NOT_FOUND', 'Invoice not found');

    if (inv.status === 'PARTIALLY_PAID' || inv.status === 'PAID') {
      throw new ApiError(409, 'INVOICE_HAS_PAYMENTS', 'Cannot cancel a partially paid or paid invoice');
    }

    const activePayment = await tx.payment.findFirst({
      where: { invoiceId, status: 'ACTIVE' },
    });
    if (activePayment) {
      throw new ApiError(409, 'INVOICE_HAS_PAYMENTS', 'Cannot cancel an invoice with active payments');
    }

    if (inv.status === 'CANCELLED') {
      throw new ApiError(409, 'ALREADY_CANCELLED', 'Invoice is already cancelled');
    }

    const cancelledBy = actor?.userId ? BigInt(actor.userId) : null;
    const cancelledAt = new Date();

    const updated = await tx.invoice.update({
      where: { id: invoiceId },
      data: {
        status: 'CANCELLED',
        cancelledBy,
        cancelledAt,
        cancelReason: data.reason,
        activeMilestoneKey: null,
      },
      include: { items: true },
    });

    const formatted = formatInvoice(updated);
    await AuditService.record(tx, {
      actor,
      action: 'INVOICE_CANCELLED',
      entityType: 'INVOICE',
      entityId: invoiceId,
      before: formatInvoice(inv),
      after: formatted,
      ip: ctx?.ip,
      requestId: ctx?.requestId,
    });

    return formatted;
  });
}
