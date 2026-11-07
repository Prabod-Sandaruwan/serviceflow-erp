import Decimal from 'decimal.js';
import prisma from '../../config/prisma';

export function toDecimalString(val: any): string {
  if (val == null) return '0.00';
  if (typeof val === 'object' && typeof val.toFixed === 'function') {
    return val.toFixed(2);
  }
  return new Decimal(String(val)).toFixed(2);
}

export async function getProjectFinancials(projectId: string) {
  const pId = BigInt(projectId);
  const [invAgg, payAgg, expAgg] = await Promise.all([
    prisma.$queryRaw<Array<{ revenue: any; billed: any }>>`
      SELECT COALESCE(SUM(subtotal), 0) AS revenue,
             COALESCE(SUM(total), 0) AS billed
      FROM invoices
      WHERE project_id = ${pId}
        AND status IN ('ISSUED', 'PARTIALLY_PAID', 'PAID')
    `,
    prisma.$queryRaw<Array<{ collected: any }>>`
      SELECT COALESCE(SUM(p.amount), 0) AS collected
      FROM payments p
      JOIN invoices i ON p.invoice_id = i.id
      WHERE i.project_id = ${pId}
        AND p.status = 'ACTIVE'
    `,
    prisma.$queryRaw<Array<{ expenses: any }>>`
      SELECT COALESCE(SUM(amount), 0) AS expenses
      FROM expenses
      WHERE project_id = ${pId}
        AND status = 'ACTIVE'
    `,
  ]);

  return {
    revenue: toDecimalString(invAgg[0]?.revenue),
    billed: toDecimalString(invAgg[0]?.billed),
    collected: toDecimalString(payAgg[0]?.collected),
    expenses: toDecimalString(expAgg[0]?.expenses),
  };
}

export async function getOverdueInvoices(asOfDate: Date) {
  const result = await prisma.$queryRaw<any[]>`
    SELECT i.id, i.invoice_number, i.project_id, i.status, i.issue_date, i.due_date,
           i.total,
           COALESCE((SELECT SUM(p.amount) FROM payments p WHERE p.invoice_id = i.id AND p.status = 'ACTIVE'), 0) AS paid_amount,
           (i.total - COALESCE((SELECT SUM(p.amount) FROM payments p WHERE p.invoice_id = i.id AND p.status = 'ACTIVE'), 0)) AS balance
    FROM invoices i
    WHERE i.due_date < ${asOfDate}
      AND i.status IN ('ISSUED', 'PARTIALLY_PAID')
      AND (i.total - COALESCE((SELECT SUM(p.amount) FROM payments p WHERE p.invoice_id = i.id AND p.status = 'ACTIVE'), 0)) > 0
    ORDER BY i.due_date ASC
  `;

  return result.map((row) => ({
    id: row.id.toString(),
    invoiceNumber: row.invoice_number,
    projectId: row.project_id.toString(),
    status: row.status,
    issueDate: row.issue_date instanceof Date ? row.issue_date.toISOString().slice(0, 10) : String(row.issue_date).slice(0, 10),
    dueDate: row.due_date instanceof Date ? row.due_date.toISOString().slice(0, 10) : String(row.due_date).slice(0, 10),
    total: toDecimalString(row.total),
    paidAmount: toDecimalString(row.paid_amount),
    balance: toDecimalString(row.balance),
  }));
}
