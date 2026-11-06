import { describe, it, expect } from 'vitest';
import { recordPaymentSchema } from '../../src/modules/payments/payments.schemas';
import { calculateBalance, statusFor } from '../../src/modules/payments/balance';

describe('Payment Unit Tests (PAY-009)', () => {
  describe('Block 1: Status Recomputation & Balance', () => {
    it('paid = 0 results in ISSUED', () => {
      expect(statusFor('100.00', '0.00')).toBe('ISSUED');
      expect(statusFor(500, 0)).toBe('ISSUED');
    });

    it('paid > 0 and paid < total results in PARTIALLY_PAID', () => {
      expect(statusFor('100.00', '50.00')).toBe('PARTIALLY_PAID');
      expect(statusFor(100, 99.99)).toBe('PARTIALLY_PAID');
      expect(statusFor(100, 0.01)).toBe('PARTIALLY_PAID');
    });

    it('paid == total results in PAID', () => {
      expect(statusFor('100.00', '100.00')).toBe('PAID');
      expect(statusFor(500, 500)).toBe('PAID');
    });

    it('calculates exactly-equal balance deduction (balance: 0.00)', () => {
      expect(calculateBalance('100.00', '100.00')).toBe('0.00');
      expect(calculateBalance(500, 500)).toBe('0.00');
    });

    it('handles one-cent-over deduction logic gracefully returning 0.00', () => {
      expect(calculateBalance('100.00', '100.01')).toBe('0.00');
      expect(calculateBalance(100, 150)).toBe('0.00');
    });
  });

  describe('Block 2: Schema Validation - Amount & Dates', () => {
    it('amount must be strictly greater than 0 (fails for 0.00 or negative)', () => {
      expect(recordPaymentSchema.safeParse({ amount: '0.00', method: 'CASH', date: '2026-11-01' }).success).toBe(false);
      expect(recordPaymentSchema.safeParse({ amount: '-10.00', method: 'CASH', date: '2026-11-01' }).success).toBe(false);
      expect(recordPaymentSchema.safeParse({ amount: '0', method: 'CASH', date: '2026-11-01' }).success).toBe(false);
    });

    it('valid amount like 50.00 passes validation', () => {
      const res = recordPaymentSchema.safeParse({ amount: '50.00', method: 'CASH', date: '2026-11-01' });
      expect(res.success).toBe(true);
      if (res.success) expect(res.data.amount).toBe('50.00');
    });

    it('validates date formatting and rejects future dates', () => {
      const future = new Date();
      future.setDate(future.getDate() + 2);
      expect(recordPaymentSchema.safeParse({
        amount: '50.00', method: 'CASH', date: future.toISOString().slice(0, 10),
      }).success).toBe(false);
      expect(recordPaymentSchema.safeParse({
        amount: '50.00', method: 'CASH', date: '2026-11-01',
      }).success).toBe(true);
    });
  });

  describe('Block 3: Schema Validation - Reference Rules', () => {
    it('allows CASH method with optional or omitted reference', () => {
      expect(recordPaymentSchema.safeParse({ amount: '50.00', method: 'CASH', date: '2026-11-01' }).success).toBe(true);
      expect(recordPaymentSchema.safeParse({ amount: '50.00', method: 'CASH', date: '2026-11-01', reference: 'CASH-REC-1' }).success).toBe(true);
    });

    it('fails when BANK_TRANSFER reference is missing or empty', () => {
      expect(recordPaymentSchema.safeParse({ amount: '50.00', method: 'BANK_TRANSFER', date: '2026-11-01' }).success).toBe(false);
      expect(recordPaymentSchema.safeParse({ amount: '50.00', method: 'BANK_TRANSFER', date: '2026-11-01', reference: '   ' }).success).toBe(false);
      expect(recordPaymentSchema.safeParse({ amount: '50.00', method: 'BANK_TRANSFER', date: '2026-11-01', reference: 'WIRE-1234' }).success).toBe(true);
    });

    it('fails when CARD reference is missing or empty', () => {
      expect(recordPaymentSchema.safeParse({ amount: '50.00', method: 'CARD', date: '2026-11-01' }).success).toBe(false);
      expect(recordPaymentSchema.safeParse({ amount: '50.00', method: 'CARD', date: '2026-11-01', reference: '' }).success).toBe(false);
      expect(recordPaymentSchema.safeParse({ amount: '50.00', method: 'CARD', date: '2026-11-01', reference: 'CARD-AUTH-999' }).success).toBe(true);
    });
  });
});
