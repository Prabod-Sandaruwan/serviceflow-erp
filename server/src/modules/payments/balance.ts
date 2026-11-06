import Decimal from 'decimal.js';

export const toDecimal = (val: string | number | Decimal): Decimal => {
  if (val == null) return new Decimal(0);
  if (val instanceof Decimal) return val;
  const str = typeof val === 'number' ? val.toString() : String(val).trim();
  try {
    return new Decimal(str);
  } catch {
    return new Decimal(0);
  }
};

export async function paidAmount(tx: any, invoiceId: string | number): Promise<string> {
  let sum: any = null;

  if (typeof tx?.query === 'function') {
    const res = await tx.query(
      "SELECT SUM(amount) AS total FROM payments WHERE invoice_id = ? AND status = 'ACTIVE'",
      [invoiceId]
    );
    const row = Array.isArray(res) ? res[0] : res?.rows?.[0];
    sum = row?.total ?? row?.sum ?? row?.amount ?? null;
  } else if (tx?.payment?.aggregate) {
    const id = typeof invoiceId === 'bigint' ? invoiceId : BigInt(invoiceId);
    const agg = await tx.payment.aggregate({
      where: { invoiceId: id, status: 'ACTIVE' },
      _sum: { amount: true },
    });
    sum = agg._sum?.amount ?? null;
  } else if (typeof tx?.$queryRaw === 'function') {
    const id = typeof invoiceId === 'bigint' ? invoiceId : BigInt(invoiceId);
    const rows: any = await tx.$queryRaw`
      SELECT SUM(amount) AS total FROM payments WHERE invoice_id = ${id} AND status = 'ACTIVE'
    `;
    sum = rows?.[0]?.total ?? null;
  }

  if (sum == null) return '0.00';
  return toDecimal(sum).toFixed(2);
}

export function calculateBalance(total: string | number, paid: string | number): string {
  const t = toDecimal(total);
  const p = toDecimal(paid);
  const diff = t.minus(p);
  if (diff.isNegative() || diff.isZero()) {
    return '0.00';
  }
  return diff.toFixed(2);
}

export function statusFor(total: string | number, paid: string | number): string {
  const t = Number(total);
  const p = Number(paid);
  if (isNaN(p) || p <= 0) return 'ISSUED';
  if (p < t) return 'PARTIALLY_PAID';
  return 'PAID';
}

