import prisma from '../../config/prisma';
import { runInTransaction } from '../../shared/tx';
import { ApiError } from '../../shared/errors';
import { AuditService } from '../audit/audit.service';
import { paidAmount, calculateBalance, statusFor } from './balance';
import { VoidPaymentInput } from './payments.schemas';
import { formatPayment } from './payments.formatter';
import { PaymentActor } from './payments.service';

export async function voidPayment(
  id: string | bigint | number,
  data: VoidPaymentInput,
  actor?: PaymentActor,
  ctx?: { ip?: string; requestId?: string }
) {
  let paymentId: bigint;
  try {
    paymentId = BigInt(id);
  } catch {
    throw new ApiError(404, 'NOT_FOUND', 'Payment not found');
  }

  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) throw new ApiError(404, 'NOT_FOUND', 'Payment not found');
  if (payment.status === 'VOIDED') {
    throw new ApiError(409, 'ALREADY_VOIDED', 'Payment is already voided');
  }

  const invoiceId = payment.invoiceId;
  const voidedBy = actor?.userId ? BigInt(actor.userId) : null;
  const voidedAt = new Date();

  return runInTransaction(async (tx) => {
    const pRows = await tx.$queryRaw<
      any[]
    >`SELECT id, status FROM payments WHERE id = ${paymentId} FOR UPDATE`;
    const curPay = pRows?.[0];
    if (!curPay) throw new ApiError(404, 'NOT_FOUND', 'Payment not found');
    if (curPay.status === 'VOIDED') {
      throw new ApiError(409, 'ALREADY_VOIDED', 'Payment is already voided');
    }

    const rows = await tx.$queryRaw<
      any[]
    >`SELECT id, total, status FROM invoices WHERE id = ${invoiceId} FOR UPDATE`;
    const inv = rows?.[0];
    if (!inv) throw new ApiError(404, 'NOT_FOUND', 'Invoice not found');

    const updatedPayment = await tx.payment.update({
      where: { id: paymentId },
      data: {
        status: 'VOIDED',
        voidReason: data.reason.trim(),
        voidedBy,
        voidedAt,
      },
    });

    const totalStr = Number(inv.total).toFixed(2);
    const newPaid = await paidAmount(tx, invoiceId);
    const newStatus = statusFor(totalStr, newPaid);
    await tx.invoice.update({ where: { id: invoiceId }, data: { status: newStatus as any } });
    const newBalance = calculateBalance(totalStr, newPaid);

    await AuditService.record(tx, {
      actor,
      action: 'PAYMENT_VOIDED',
      entityType: 'PAYMENT',
      entityId: paymentId,
      before: {
        paymentId: paymentId.toString(),
        status: payment.status,
        invoiceStatus: inv.status,
      },
      after: {
        paymentId: paymentId.toString(),
        status: 'VOIDED',
        voidReason: data.reason,
        newInvoiceStatus: newStatus,
      },
      ip: ctx?.ip,
      requestId: ctx?.requestId,
    });

    return {
      payment: formatPayment(updatedPayment),
      newBalance,
      invoiceStatus: newStatus,
    };
  });
}
