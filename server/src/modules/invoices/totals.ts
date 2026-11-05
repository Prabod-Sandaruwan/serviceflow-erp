import Decimal from 'decimal.js';

export interface InvoiceItemAmountInput {
  amount: string | number;
  [key: string]: any;
}

export interface PaymentAmountInput {
  amount: string | number;
  status?: string;
  [key: string]: any;
}

export function calculateSubtotal(items: Array<InvoiceItemAmountInput>): string {
  let subtotal = new Decimal(0);
  for (const item of items) {
    const val = new Decimal(String(item.amount ?? 0));
    subtotal = subtotal.plus(val);
  }
  return subtotal.toFixed(2);
}

export function calculateTotal(
  subtotal: string | number,
  taxAmount: string | number = '0',
  _taxRate?: number
): string {
  const s = new Decimal(String(subtotal || 0));
  const t = new Decimal(String(taxAmount || 0));
  return s.plus(t).toFixed(2);
}

export function calculateBalance(
  total: string | number,
  payments: Array<PaymentAmountInput> = []
): string {
  let paid = new Decimal(0);
  for (const p of payments) {
    if (!p.status || p.status === 'ACTIVE') {
      paid = paid.plus(new Decimal(String(p.amount ?? 0)));
    }
  }
  const tot = new Decimal(String(total || 0));
  const bal = tot.minus(paid);
  return bal.toFixed(2);
}
