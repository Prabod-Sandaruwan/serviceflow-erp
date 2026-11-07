import Decimal from 'decimal.js';

export function calculateRevenue(invoices: any[]): string {
  let sum = new Decimal(0);
  const eligible = new Set(['ISSUED', 'PARTIALLY_PAID', 'PAID']);
  for (const inv of invoices || []) {
    if (eligible.has(inv.status)) {
      const sub = inv.subtotal != null ? (inv.subtotal.toString?.() ?? String(inv.subtotal)) : '0';
      sum = sum.plus(new Decimal(sub));
    }
  }
  return sum.toFixed(2);
}

export function calculatePaymentsReceived(payments: any[]): string {
  let sum = new Decimal(0);
  for (const p of payments || []) {
    if (p.status === 'ACTIVE') {
      const amt = p.amount != null ? (p.amount.toString?.() ?? String(p.amount)) : '0';
      sum = sum.plus(new Decimal(amt));
    }
  }
  return sum.toFixed(2);
}

export function calculateOutstanding(
  invoices: any[],
  paidMap: Record<string, string> = {},
  asOfDate?: Date
): string {
  let sum = new Decimal(0);
  const eligible = new Set(['ISSUED', 'PARTIALLY_PAID']);
  const asOfStr = asOfDate instanceof Date
    ? asOfDate.toISOString().slice(0, 10)
    : (asOfDate ? String(asOfDate).slice(0, 10) : undefined);

  for (const inv of invoices || []) {
    if (!eligible.has(inv.status)) continue;

    const rawDate = inv.issueDate ?? inv.issue_date;
    if (rawDate && asOfStr) {
      const invStr = rawDate instanceof Date ? rawDate.toISOString().slice(0, 10) : String(rawDate).slice(0, 10);
      if (invStr > asOfStr) continue;
    }

    const total = new Decimal(inv.total != null ? (inv.total.toString?.() ?? String(inv.total)) : '0');
    const idKey = inv.id != null ? String(inv.id) : '';
    const paid = new Decimal(paidMap[idKey] ?? (inv.id ? paidMap[inv.id] : undefined) ?? '0');
    const balance = total.minus(paid);
    if (balance.gt(0)) {
      sum = sum.plus(balance);
    }
  }
  return sum.toFixed(2);
}

export function calculateExpenses(expenses: any[]): string {
  let sum = new Decimal(0);
  for (const exp of expenses || []) {
    if (exp.status === 'ACTIVE') {
      const amt = exp.amount != null ? (exp.amount.toString?.() ?? String(exp.amount)) : '0';
      sum = sum.plus(new Decimal(amt));
    }
  }
  return sum.toFixed(2);
}

export function calculateProfit(revenue: string, expenses: string): string {
  const rev = new Decimal(revenue || '0');
  const exp = new Decimal(expenses || '0');
  return rev.minus(exp).toFixed(2);
}

export function calculateMargin(revenue: string, profit: string): number | null {
  const rev = new Decimal(revenue || '0');
  if (rev.lte(0)) return null;
  const prof = new Decimal(profit || '0');
  const margin = prof.dividedBy(rev).times(100);
  return Number(margin.toFixed(2));
}
