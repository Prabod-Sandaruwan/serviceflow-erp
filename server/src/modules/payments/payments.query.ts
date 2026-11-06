import prisma from '../../config/prisma';
import { getInvoiceById } from '../invoices/invoices.query';
import { formatPayment } from './payments.formatter';
import { PaymentActor } from './payments.service';

export async function getInvoicePayments(
  invoiceId: string | bigint | number,
  actor?: PaymentActor,
  _ctx?: { ip?: string; requestId?: string }
) {
  await getInvoiceById(invoiceId, actor as any);
  const rawId = BigInt(invoiceId);
  const payments = await prisma.payment.findMany({
    where: { invoiceId: rawId },
    orderBy: { createdAt: 'desc' },
  });
  return payments.map(formatPayment);
}
