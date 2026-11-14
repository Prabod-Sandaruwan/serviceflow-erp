import prisma from '../../config/prisma';
import { formatInvoice } from './invoices.formatter';

export async function getInvoiceStats() {
  const invoices = await prisma.invoice.findMany({
    include: {
      payments: true,
    },
  });

  let totalInvoiced = 0;
  let totalCollected = 0;
  let outstandingBalance = 0;
  let overdueAccounts = 0;
  let overdueCount = 0;

  for (const raw of invoices) {
    const formatted = formatInvoice(raw);
    const tot = Number(formatted.total || 0);
    const pd = Number(formatted.paid || 0);
    const bal = Number(formatted.balance || 0);

    totalInvoiced += tot;
    totalCollected += pd;
    if (formatted.status !== 'CANCELLED' && formatted.status !== 'PAID') {
      outstandingBalance += bal;
    }
    if (formatted.isOverdue && formatted.status !== 'PAID' && formatted.status !== 'CANCELLED') {
      overdueAccounts += bal;
      overdueCount += 1;
    }
  }

  return {
    totalInvoiced,
    totalCount: invoices.length,
    totalCollected,
    outstandingBalance,
    overdueAccounts,
    overdueCount,
  };
}

export default getInvoiceStats;

