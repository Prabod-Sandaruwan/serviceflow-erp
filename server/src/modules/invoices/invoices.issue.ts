import { runInTransaction } from '../../shared/tx';
import { ApiError } from '../../shared/errors';
import { AuditService } from '../audit/audit.service';
import { IssueInvoiceInput } from './invoices.schemas';
import { formatInvoice } from './invoices.formatter';
import { assertEditable } from './invoices.guard';
import { Actor, InvoiceServiceContext } from './invoices.create';

export async function issueInvoice(
  id: string | bigint | number,
  data: IssueInvoiceInput,
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
    const rows = await tx.$queryRaw<any[]>`
      SELECT * FROM invoices WHERE id = ${invoiceId} FOR UPDATE
    `;
    const inv = rows?.[0];
    if (!inv) throw new ApiError(404, 'NOT_FOUND', 'Invoice not found');

    assertEditable(inv);

    const milestoneId = BigInt(inv.milestone_id ?? inv.milestoneId);
    const milestone = await tx.milestone.findUnique({ where: { id: milestoneId } });
    if (!milestone || milestone.status !== 'APPROVED') {
      throw new ApiError(
        409,
        'MILESTONE_NOT_APPROVED',
        'Milestone must be approved to issue invoice'
      );
    }

    if (new Date(data.dueDate) < new Date(data.issueDate)) {
      throw new ApiError(422, 'INVALID_DUE_DATE', 'Due date must not precede issue date');
    }

    const issuedBy = actor?.userId ? BigInt(actor.userId) : null;
    const issuedAt = new Date();

    const updated = await tx.invoice.update({
      where: { id: invoiceId },
      data: {
        status: 'ISSUED',
        issueDate: new Date(data.issueDate),
        dueDate: new Date(data.dueDate),
        issuedBy,
        issuedAt,
      },
      include: { items: true },
    });

    const formatted = formatInvoice(updated);
    await AuditService.record(tx, {
      actor,
      action: 'INVOICE_ISSUED',
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
