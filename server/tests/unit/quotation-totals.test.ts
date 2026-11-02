import { describe, it, expect } from 'vitest';
import { computeTotals } from '../../src/modules/quotations/totals';

describe('Quotation Totals Calculator (QUOT-002 & QUOT-010)', () => {
  it('calculates totals matching SRS example: 1 @ 1.5M + 2 @ 125K', () => {
    const items = [
      { description: 'Server Setup', quantity: 1, unitPrice: 1500000 },
      { description: 'Workstation Licences', quantity: 2, unitPrice: 125000 },
    ];
    const result = computeTotals(items, 0);

    expect(result.lines).toHaveLength(2);
    expect(result.lines[0].lineAmount).toBe(1500000);
    expect(result.lines[1].lineAmount).toBe(250000);
    expect(result.subtotal).toBe(1750000);
    expect(result.taxAmount).toBe(0);
    expect(result.total).toBe(1750000);
  });

  it('safely rounds line amounts and totals with decimal edge cases like 10.005', () => {
    const items = [
      { description: 'Item 1', quantity: 1, unitPrice: 10.005 },
      { description: 'Item 2', quantity: 2, unitPrice: 5.004 },
    ];
    const result = computeTotals(items, 1.5);

    expect(result.lines[0].lineAmount).toBe(10.01);
    expect(result.lines[1].lineAmount).toBe(10.01);
    expect(result.subtotal).toBe(20.02);
    expect(result.taxAmount).toBe(1.5);
    expect(result.total).toBe(21.52);
  });

  it('handles various taxAmount values: 0, 500.50, and large amounts', () => {
    const items = [{ quantity: 3, unitPrice: 1000 }];

    expect(computeTotals(items, 0)).toMatchObject({ subtotal: 3000, taxAmount: 0, total: 3000 });
    expect(computeTotals(items, 500.5)).toMatchObject({ subtotal: 3000, taxAmount: 500.5, total: 3500.5 });
    expect(computeTotals(items, 315000.75)).toMatchObject({ subtotal: 3000, taxAmount: 315000.75, total: 318000.75 });
    expect(computeTotals(items)).toMatchObject({ subtotal: 3000, taxAmount: 0, total: 3000 });
  });

  it('throws validation errors for invalid quantities, prices, taxes, and empty items', () => {
    expect(() => computeTotals([])).toThrow(/empty/i);
    expect(() => computeTotals([{ quantity: 0, unitPrice: 50 }])).toThrow(/greater than zero/i);
    expect(() => computeTotals([{ quantity: -1, unitPrice: 50 }])).toThrow(/greater than zero/i);
    expect(() => computeTotals([{ quantity: 2, unitPrice: -50 }])).toThrow(/cannot be negative/i);
    expect(() => computeTotals([{ quantity: 2, unitPrice: 50 }], -10)).toThrow(/cannot be negative/i);
  });
});
