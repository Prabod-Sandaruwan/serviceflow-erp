import prisma from '../../config/prisma';
import { runInTransaction } from '../../shared/tx';
import { ApiError } from '../../shared/errors';
import { AuditService } from '../audit/audit.service';
import { paidAmount, calculateBalance, statusFor } from './balance';
import { RecordPaymentInput } from './payments.schemas';
import { formatPayment } from './payments.formatter';

export interface PaymentActor { userId: string; role: string; employeeId?: string; }
export { getInvoicePayments } from './payments.query';
export { voidPayment } from './payments.void';

export async function recordPayment(
  id: string | bigint | number, data: RecordPaymentInput, actor?: PaymentActor,
  ctx?: { ip?: string; requestId?: string }, idempotencyKey?: string
) {
  let invoiceId: bigint;
  try { invoiceId = BigInt(id); } catch { throw new ApiError(404, 'NOT_FOUND', 'Invoice not found'); }
  const idemKey = idempotencyKey?.trim() || data.idempotencyKey?.trim() || null;

  if (idemKey) {
    const existing = await prisma.payment.findUnique({ where: { idempotencyKey: idemKey }, include: { invoice: true } });
    if (existing) {
      if (existing.invoiceId.toString() !== invoiceId.toString()) {
        throw new ApiError(409, 'IDEMPOTENCY_KEY_IN_USE', 'Idempotency key has already been used for another invoice');
      }
      const paid = await paidAmount(prisma, invoiceId);
      const bal = calculateBalance(Number(existing.invoice.total).toFixed(2), paid);
      return { payment: formatPayment(existing), newBalance: bal, invoiceStatus: existing.invoice.status, httpStatus: 200 };
    }
  }

  if (actor?.role === 'STAFF') {
    const empId = actor.employeeId != null ? BigInt(actor.employeeId) : -1n;
    const ok = await prisma.invoice.findFirst({
      where: { id: invoiceId, project: { tasks: { some: { assigneeId: empId, status: { not: 'CANCELLED' } } } } },
      select: { id: true },
    });
    if (!ok) throw new ApiError(403, 'FORBIDDEN', 'Access to this invoice is restricted');
  }

  return runInTransaction(async (tx) => {
    const rows = await tx.$queryRaw<any[]>`SELECT id, total, status, issue_date FROM invoices WHERE id = ${invoiceId} FOR UPDATE`;
    const inv = rows?.[0];
    if (!inv) throw new ApiError(404, 'NOT_FOUND', 'Invoice not found');
    if (inv.status !== 'ISSUED' && inv.status !== 'PARTIALLY_PAID') {
      throw new ApiError(409, 'INVALID_INVOICE_STATUS', 'Payments can only be recorded for ISSUED or PARTIALLY_PAID invoices');
    }
    const payDate = new Date(data.date);
    if (inv.issue_date && payDate.toISOString().slice(0, 10) < new Date(inv.issue_date).toISOString().slice(0, 10)) {
      throw new ApiError(422, 'PAYMENT_DATE_INVALID', 'Payment date cannot precede invoice issue date');
    }

    const totalStr = Number(inv.total).toFixed(2);
    const currentPaid = await paidAmount(tx, invoiceId);
    const currentBalance = calculateBalance(totalStr, currentPaid);
    if (Number(data.amount) > Number(currentBalance)) {
      throw new ApiError(422, 'PAYMENT_EXCEEDS_BALANCE', `Payment amount exceeds current balance of ${currentBalance}`, { max: currentBalance } as any);
    }

    let payment: any;
    try {
      payment = await tx.payment.create({
        data: {
          invoiceId, amount: data.amount, method: data.method, paymentDate: payDate,
          reference: data.reference?.trim() || null, note: data.note?.trim() || null,
          idempotencyKey: idemKey, status: 'ACTIVE', recordedBy: actor?.userId ? BigInt(actor.userId) : 1n,
        },
      });
    } catch (err: any) {
      if (err.code === 'P2002') throw new ApiError(409, 'IDEMPOTENCY_KEY_IN_USE', 'Idempotency key already used');
      throw err;
    }

    const newPaid = (Number(currentPaid) + Number(data.amount)).toFixed(2);
    const newStatus = statusFor(totalStr, newPaid);
    await tx.invoice.update({ where: { id: invoiceId }, data: { status: newStatus as any } });
    const newBalance = calculateBalance(totalStr, newPaid);

    await AuditService.record(tx, {
      actor, action: 'PAYMENT_RECORDED', entityType: 'PAYMENT', entityId: payment.id,
      before: { invoiceId: invoiceId.toString(), status: inv.status, balance: currentBalance },
      after: { paymentId: payment.id.toString(), amount: data.amount, newStatus, newBalance },
      ip: ctx?.ip, requestId: ctx?.requestId,
    });

    return { payment: formatPayment(payment), newBalance, invoiceStatus: newStatus, httpStatus: 201 };
  });
}
