import { describe, it, expect } from 'vitest';
import { createInvoiceSchema } from '../../src/modules/invoices/invoices.schemas';
import { createQuotationSchema } from '../../src/modules/quotations/quotations.schemas';

describe('Unbounded Collections DoS Protection (CWE-400)', () => {
  it('rejects an invoice with more than 100 line items', () => {
    const items = Array.from({ length: 101 }, (_, i) => ({
      description: `Item ${i + 1}`,
      amount: '10.00',
    }));
    const res = createInvoiceSchema.safeParse({ milestoneId: '1', items });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.issues.some((i) => i.message.includes('100 items'))).toBe(true);
    }
  });

  it('accepts an invoice with <= 100 line items', () => {
    const items = Array.from({ length: 50 }, (_, i) => ({
      description: `Item ${i + 1}`,
      amount: '10.00',
    }));
    const res = createInvoiceSchema.safeParse({ milestoneId: '1', items });
    expect(res.success).toBe(true);
  });

  it('rejects a quotation with more than 100 line items', () => {
    const items = Array.from({ length: 101 }, (_, i) => ({
      description: `Item ${i + 1}`,
      quantity: 1,
      unitPrice: 10,
    }));
    const res = createQuotationSchema.safeParse({
      clientId: 'c1',
      title: 'Large Quotation',
      validUntil: '2099-12-31',
      items,
    });
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.issues.some((i) => i.message.includes('100 items'))).toBe(true);
    }
  });
});
