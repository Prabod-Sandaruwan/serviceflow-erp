import { Decimal } from 'decimal.js';
import prisma from '../../config/prisma';
import { runInTransaction } from '../../shared/tx';
import { AuditService } from '../audit/audit.service';
import { AUDIT_ACTIONS } from '../audit/actions';

export type Actor = { userId?: bigint | string; role?: string };

export async function sendDunningNotices(actor: Actor, ip?: string, requestId?: string) {
  const now = new Date();
  const overdueInvoices = await prisma.invoice.findMany({
    where: {
      status: { in: ['ISSUED', 'PARTIALLY_PAID'] },
      dueDate: { lt: now },
    },
    include: {
      payments: { where: { status: 'ACTIVE' } },
    },
  });

  let totalOverdue = new Decimal(0);
  const eligibleInvoices: Array<{ id: string; invoiceNumber: string; balance: string }> = [];

  for (const inv of overdueInvoices) {
    const paid = inv.payments.reduce(
      (sum, p) => sum.plus(new Decimal(p.amount.toString())),
      new Decimal(0)
    );
    const bal = new Decimal(inv.total.toString()).minus(paid);
    if (bal.gt(0)) {
      totalOverdue = totalOverdue.plus(bal);
      eligibleInvoices.push({
        id: inv.id.toString(),
        invoiceNumber: inv.invoiceNumber,
        balance: bal.toFixed(2),
      });
    }
  }

  if (eligibleInvoices.length > 0) {
    await runInTransaction(async (tx) => {
      await AuditService.record(tx, {
        actor: { userId: actor.userId, role: actor.role },
        action: AUDIT_ACTIONS.INVOICE_DUNNING_SENT,
        entityType: 'INVOICE',
        after: {
          dispatchedCount: eligibleInvoices.length,
          totalOverdue: totalOverdue.toFixed(2),
          invoices: eligibleInvoices.map((i) => i.invoiceNumber),
        },
        ip,
        requestId,
      });
    });
  }

  return {
    dispatchedCount: eligibleInvoices.length,
    totalOverdue: totalOverdue.toFixed(2),
    invoices: eligibleInvoices,
  };
}
