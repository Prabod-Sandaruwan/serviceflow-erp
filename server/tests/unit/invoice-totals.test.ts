import { describe, it, expect } from 'vitest';
import { calculateSubtotal, calculateTotal, calculateBalance } from '../../src/modules/invoices/totals';
import { createInvoiceSchema, createInvoiceItemSchema } from '../../src/modules/invoices/invoices.schemas';

describe('Invoice Totals and Manual Tax Calculation', () => {
  it('Test 1 (Subtotal): Items with amounts 400000.00 and 100000.00 give a subtotal of 500000.00', () => {
    const items = [{ amount: '400000.00' }, { amount: '100000.00' }];
    const subtotal = calculateSubtotal(items);
    expect(subtotal).toBe('500000.00');
  });

  it('Test 2 (Total): Subtotal 500000.00 + tax amount 90000.00 gives a total of 590000.00', () => {
    const subtotal = '500000.00';
    const taxAmount = '90000.00';
    const total = calculateTotal(subtotal, taxAmount);
    expect(total).toBe('590000.00');
  });

  it('Test 3 (Rate Independence): Providing taxRate (50%) with taxAmount (90000.00) uses exact 90000.00 without computing 50%', () => {
    const subtotal = '500000.00';
    const taxRate = 50; // 50%
    const taxAmount = '90000.00';

    // Directly testing calculateTotal ignores taxRate
    const totalWithRate = calculateTotal(subtotal, taxAmount, taxRate);
    expect(totalWithRate).toBe('590000.00');
    expect(totalWithRate).not.toBe('750000.00'); // 500000 + 50% would be 750000

    // Testing through invoice input payload
    const invoicePayload = {
      milestoneId: '1',
      taxRate,
      taxAmount,
      items: [{ description: 'Item 1', amount: '500000.00' }],
    };
    const parsed = createInvoiceSchema.parse(invoicePayload);
    const subtotalCalc = calculateSubtotal(parsed.items!);
    const totalCalc = calculateTotal(subtotalCalc, parsed.taxAmount, parsed.taxRate ?? undefined);
    expect(totalCalc).toBe('590000.00');
    expect(totalCalc).not.toBe('750000.00');
  });

  it('guarantees decimal precision without floating point drift', () => {
    const items = [{ amount: '0.10' }, { amount: '0.20' }];
    expect(calculateSubtotal(items)).toBe('0.30');
    expect(calculateTotal('0.10', '0.20')).toBe('0.30');
  });

  it('validates taxAmount and amount boundaries in schema', () => {
    expect(() => createInvoiceItemSchema.parse({ description: 'A', amount: '-10' })).toThrow();
    expect(() => createInvoiceSchema.parse({ milestoneId: '1', taxAmount: '-1' })).toThrow();
    expect(() => createInvoiceSchema.parse({ milestoneId: '1', taxRate: 105 })).toThrow();
    expect(() => createInvoiceSchema.parse({ milestoneId: '1', taxRate: -5 })).toThrow();
  });

  it('calculates balance by subtracting active payments and excluding voided/cancelled', () => {
    const total = '1000.00';
    const payments = [
      { amount: '300.00', status: 'ACTIVE' },
      { amount: '150.00' },
      { amount: '200.00', status: 'VOIDED' },
      { amount: '100.00', status: 'CANCELLED' },
    ];
    expect(calculateBalance(total, payments)).toBe('550.00');
    expect(calculateBalance(total, [])).toBe('1000.00');
  });
});

