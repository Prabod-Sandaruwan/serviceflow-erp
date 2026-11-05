import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatInvoice } from '../../src/modules/invoices/invoices.formatter';
import { isOverdueInvoice } from '../../src/shared/dates';

describe('Invoice Overdue Calculation (INV-010)', () => {
  const fixedDate = new Date('2026-11-05T10:00:00.000Z');
  const todayStr = '2026-11-05';
  const yesterdayStr = '2026-11-04';

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(fixedDate);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('Test 1: ISSUED invoice, due yesterday, balance > 0 => isOverdue is TRUE', () => {
    const inv = { status: 'ISSUED', dueDate: yesterdayStr, total: '1000.00' };
    expect(formatInvoice(inv).isOverdue).toBe(true);
    expect(isOverdueInvoice({ ...inv, balance: '1000.00' })).toBe(true);
  });

  it('Test 2: ISSUED invoice, due TODAY, balance > 0 => isOverdue is FALSE (boundary case)', () => {
    const inv = { status: 'ISSUED', dueDate: todayStr, total: '1000.00' };
    expect(formatInvoice(inv).isOverdue).toBe(false);
    expect(isOverdueInvoice({ ...inv, balance: '1000.00' })).toBe(false);
  });

  it('Test 3: PAID invoice, due yesterday => isOverdue is FALSE', () => {
    const inv = { status: 'PAID', dueDate: yesterdayStr, total: '1000.00' };
    expect(formatInvoice(inv).isOverdue).toBe(false);
    expect(isOverdueInvoice({ ...inv, balance: '0.00' })).toBe(false);
  });

  it('Test 4: DRAFT invoice, due yesterday => isOverdue is FALSE', () => {
    const inv = { status: 'DRAFT', dueDate: yesterdayStr, total: '1000.00' };
    expect(formatInvoice(inv).isOverdue).toBe(false);
    expect(isOverdueInvoice({ ...inv, balance: '1000.00' })).toBe(false);
  });

  it('handles PARTIALLY_PAID status and null due dates safely', () => {
    const partial = { status: 'PARTIALLY_PAID', dueDate: yesterdayStr, balance: '250.00' };
    expect(isOverdueInvoice(partial)).toBe(true);
    expect(formatInvoice({ status: 'ISSUED', dueDate: null, total: '500.00' }).isOverdue).toBe(false);
  });
});
