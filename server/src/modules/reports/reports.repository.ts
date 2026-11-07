import Decimal from 'decimal.js';
import prisma from '../../config/prisma';

export { getProjectFinancials, getOverdueInvoices } from './reports.project.repo';

function toDecimalString(val: any): string {
  if (val == null) return '0.00';
  if (typeof val === 'object' && typeof val.toFixed === 'function') {
    return val.toFixed(2);
  }
  return new Decimal(String(val)).toFixed(2);
}

export async function getRevenue(startDate: Date, endDate: Date): Promise<string> {
  const result = await prisma.$queryRaw<Array<{ total: any }>>`
    SELECT COALESCE(SUM(subtotal), 0) AS total
    FROM invoices
    WHERE status IN ('ISSUED', 'PARTIALLY_PAID', 'PAID')
      AND issue_date >= ${startDate}
      AND issue_date <= ${endDate}
  `;
  return toDecimalString(result[0]?.total);
}

export async function getPaymentsReceived(startDate: Date, endDate: Date): Promise<string> {
  const result = await prisma.$queryRaw<Array<{ total: any }>>`
    SELECT COALESCE(SUM(amount), 0) AS total
    FROM payments
    WHERE status = 'ACTIVE'
      AND payment_date >= ${startDate}
      AND payment_date <= ${endDate}
  `;
  return toDecimalString(result[0]?.total);
}

export async function getOutstanding(asOfDate: Date): Promise<string> {
  const result = await prisma.$queryRaw<Array<{ total: any }>>`
    SELECT COALESCE(SUM(i.total - COALESCE((
      SELECT SUM(p.amount)
      FROM payments p
      WHERE p.invoice_id = i.id AND p.status = 'ACTIVE'
    ), 0)), 0) AS total
    FROM invoices i
    WHERE i.status IN ('ISSUED', 'PARTIALLY_PAID')
      AND i.issue_date <= ${asOfDate}
  `;
  return toDecimalString(result[0]?.total);
}
