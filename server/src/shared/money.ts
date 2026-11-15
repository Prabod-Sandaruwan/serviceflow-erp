import Decimal from 'decimal.js';

export const MoneyDecimal = Decimal.clone({
  rounding: Decimal.ROUND_HALF_UP,
  precision: 28,
});

export type MoneyInput = string | Decimal | { toString(): string };

export const parseMoney = (val: unknown): Decimal => {
  if (typeof val === 'number') {
    throw new TypeError('JavaScript numbers are forbidden for money. Use decimal string.');
  }
  if (val === null || val === undefined) {
    throw new Error('Money value cannot be null or undefined');
  }
  const str =
    typeof val === 'string'
      ? val.trim()
      : typeof (val as any).toString === 'function'
        ? (val as any).toString()
        : '';

  if (!/^-?\d+(\.\d{1,2})?$/.test(str)) {
    throw new Error(`Invalid money format or exceeds 2 decimal places: ${str}`);
  }
  const d = new MoneyDecimal(str);
  if (!d.isFinite()) {
    throw new Error('Money value must be finite');
  }
  return d;
};

export const round = (val: string | number | Decimal, decimals = 2): string => {
  const d = new MoneyDecimal(val instanceof Decimal ? val.toString() : val);
  return d.toFixed(decimals);
};

export const toFixed2 = (val: MoneyInput): string => parseMoney(val).toFixed(2);

export const fromPrisma = (val: unknown): string => {
  if (val === null || val === undefined) return '0.00';
  return toFixed2(val as MoneyInput);
};

export const add = (a: MoneyInput, b: MoneyInput): string =>
  parseMoney(a).plus(parseMoney(b)).toFixed(2);

export const sub = (a: MoneyInput, b: MoneyInput): string =>
  parseMoney(a).minus(parseMoney(b)).toFixed(2);

export const mul = (a: MoneyInput, factor: string | number | Decimal): string => {
  const f = new MoneyDecimal(factor instanceof Decimal ? factor.toString() : factor);
  return parseMoney(a).times(f).toFixed(2);
};

export const lineAmount = (qty: string | number | Decimal, unitPrice: MoneyInput): string => {
  const q = new MoneyDecimal(qty instanceof Decimal ? qty.toString() : qty);
  return q.times(parseMoney(unitPrice)).toFixed(2);
};

export const sum = (list: MoneyInput[]): string => {
  let total = new MoneyDecimal(0);
  for (const item of list) {
    total = total.plus(parseMoney(item));
  }
  return total.toFixed(2);
};

export const eq = (a: MoneyInput, b: MoneyInput): boolean => parseMoney(a).equals(parseMoney(b));

export const gt = (a: MoneyInput, b: MoneyInput): boolean =>
  parseMoney(a).greaterThan(parseMoney(b));

export const gte = (a: MoneyInput, b: MoneyInput): boolean =>
  parseMoney(a).greaterThanOrEqualTo(parseMoney(b));

export const lt = (a: MoneyInput, b: MoneyInput): boolean => parseMoney(a).lessThan(parseMoney(b));

export const lte = (a: MoneyInput, b: MoneyInput): boolean =>
  parseMoney(a).lessThanOrEqualTo(parseMoney(b));
