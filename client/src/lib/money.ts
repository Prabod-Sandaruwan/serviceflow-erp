import Decimal from 'decimal.js';

export const MoneyDecimal = Decimal.clone({
  rounding: Decimal.ROUND_HALF_UP,
  precision: 28,
});

export const parseMoney = (val: unknown): Decimal => {
  if (val === null || val === undefined) return new MoneyDecimal(0);
  const str = String(val).trim();
  if (str === '') return new MoneyDecimal(0);
  try {
    const d = new MoneyDecimal(str);
    return d.isFinite() ? d : new MoneyDecimal(0);
  } catch {
    return new MoneyDecimal(0);
  }
};

export const toFixed2 = (val: unknown): string => parseMoney(val).toFixed(2);

export const multiplyMoney = (qty: unknown, price: unknown): string =>
  parseMoney(qty).times(parseMoney(price)).toFixed(2);

export const addMoney = (a: unknown, b: unknown): string =>
  parseMoney(a).plus(parseMoney(b)).toFixed(2);

export const calculateQuotationTotals = (
  items: Array<{ quantity?: unknown; unitPrice?: unknown }>,
  taxAmount: unknown = '0.00',
) => {
  let subtotal = new MoneyDecimal(0);
  for (const item of items) {
    const qty = parseMoney(item.quantity);
    const price = parseMoney(item.unitPrice);
    subtotal = subtotal.plus(qty.times(price));
  }
  const tax = parseMoney(taxAmount);
  const total = subtotal.plus(tax);
  return {
    subtotal: subtotal.toFixed(2),
    taxAmount: tax.toFixed(2),
    total: total.toFixed(2),
  };
};
