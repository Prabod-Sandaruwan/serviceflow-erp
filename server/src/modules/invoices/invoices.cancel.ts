import { runInTransaction } from '../../shared/tx';
import { ApiError } from '../../shared/errors';
import { AuditService } from '../audit/audit.service';
import { CancelInvoiceInput } from './invoices.schemas';
import { formatInvoice } from './invoices.formatter';
import { assertCancellable } from './invoices.guard';
import { Actor, InvoiceServiceContext } from './invoices.create';

export async function cancelInvoice(
  id: string | bigint | number,
  data: CancelInvoiceInput,
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
    const rows = await tx.$queryRaw<
      any[]
    >`SELECT * FROM invoices WHERE id = ${invoiceId} FOR UPDATE`;
    const inv = rows?.[0];
    if (!inv) throw new ApiError(404, 'NOT_FOUND', 'Invoice not found');

    assertCancellable(inv);

    const activePayments = await tx.$queryRaw<any[]>`
      SELECT COUNT(*) as count FROM payments WHERE invoice_id = ${invoiceId} AND status = 'ACTIVE'
    `;
    const count = Number(activePayments?.[0]?.count ?? 0);
    if (count > 0) {
      throw new ApiError(
        409,
        'INVOICE_HAS_PAYMENTS',
        'Cannot cancel an invoice with active payments'
      );
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
