import { describe, it, expect } from 'vitest';
import {
  calculateRevenue,
  calculatePaymentsReceived,
  calculateOutstanding,
  calculateExpenses,
  calculateProfit,
  calculateMargin,
} from '../../src/modules/reports/formulas';

describe('Financial Report Formulas (FIN-004)', () => {
  const invoices = [
    { id: '1', status: 'ISSUED', subtotal: '200000.00', total: '236000.00', issueDate: '2026-01-10' },
    { id: '2', status: 'PARTIALLY_PAID', subtotal: '150000.00', total: '177000.00', issueDate: '2026-01-15' },
    { id: '3', status: 'PAID', subtotal: '150000.00', total: '177000.00', issueDate: '2026-01-20' },
    { id: '4', status: 'DRAFT', subtotal: '80000.00', total: '94400.00', issueDate: '2026-01-22' },
    { id: '5', status: 'CANCELLED', subtotal: '50000.00', total: '59000.00', issueDate: '2026-01-25' },
    { id: '6', status: 'ISSUED', subtotal: '60000.00', total: '70800.00', issueDate: '2026-02-10' },
  ];

  const expenses = [
    { id: '1', status: 'ACTIVE', amount: '70000.00', expenseDate: '2026-01-12' },
    { id: '2', status: 'ACTIVE', amount: '50000.00', expenseDate: '2026-01-18' },
    { id: '3', status: 'VOIDED', amount: '35000.00', expenseDate: '2026-01-20' },
  ];

  const payments = [
    { id: '1', invoiceId: '2', status: 'ACTIVE', amount: '50000.00' },
    { id: '2', invoiceId: '3', status: 'ACTIVE', amount: '177000.00' },
    { id: '3', invoiceId: '1', status: 'VOIDED', amount: '25000.00' },
  ];

  it('Test 1 (Revenue): sums subtotal of issued, partially paid and paid invoices', () => {
    // Only first 3 invoices in Jan (and invoice 6 in Feb, so filter or pass Jan items):
    const janInvoices = invoices.filter((i) => i.id !== '6');
    expect(calculateRevenue(janInvoices)).toBe('500000.00');
  });

  it('Test 2 (Expenses): sums amount of active expenses and ignores voided', () => {
    expect(calculateExpenses(expenses)).toBe('120000.00');
  });

  it('Test 3 (Profit): calculates revenue minus expenses', () => {
    expect(calculateProfit('500000.00', '120000.00')).toBe('380000.00');
  });

  it('Test 4 (Margin): returns profit margin percentage rounded to 2 decimals', () => {
    expect(calculateMargin('500000.00', '380000.00')).toBe(76.00);
  });

  it('Test 5 (Zero Margin Rule): returns null when revenue is zero or negative', () => {
    expect(calculateMargin('0.00', '0.00')).toBeNull();
    expect(calculateMargin('-1000.00', '500.00')).toBeNull();
  });

  it('Test 6 (Payments & Outstanding): sums active payments and computes receivables as of date', () => {
    expect(calculatePaymentsReceived(payments)).toBe('227000.00');

    const paidMap = { '2': '50000.00', '3': '177000.00' };
    const asOf = new Date('2026-01-31');
    // Invoice 1 (236000.00) + Invoice 2 (177000 - 50000 = 127000.00) = 363000.00
    // Invoice 6 is in Feb (> asOf), Invoice 3 is PAID, 4 is DRAFT, 5 is CANCELLED
    expect(calculateOutstanding(invoices, paidMap, asOf)).toBe('363000.00');
  });
});
