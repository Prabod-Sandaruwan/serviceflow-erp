import { describe, it, expect, vi } from 'vitest';
import { calculateBalance, statusFor, paidAmount } from '../../src/modules/payments/balance';

describe('Payment Balance & Status Utilities (PAY-002)', () => {
  describe('calculateBalance', () => {
    it('subtracts paid from total and returns decimal-formatted string', () => {
      expect(calculateBalance(1000, 400)).toBe('600.00');
      expect(calculateBalance('1000.50', '400.25')).toBe('600.25');
      expect(calculateBalance('250.00', '50.00')).toBe('200.00');
    });

    it('returns "0.00" when fully paid or overpaid (never returns negative)', () => {
      expect(calculateBalance(1000, 1000)).toBe('0.00');
      expect(calculateBalance(1000, 1200)).toBe('0.00');
      expect(calculateBalance('500.00', '600.00')).toBe('0.00');
      expect(calculateBalance('0.00', '0.00')).toBe('0.00');
    });
  });

  describe('statusFor', () => {
    it('returns ISSUED when paid <= 0', () => {
      expect(statusFor(1000, 0)).toBe('ISSUED');
      expect(statusFor(1000, -10)).toBe('ISSUED');
      expect(statusFor('1000.00', '0.00')).toBe('ISSUED');
    });

    it('returns PARTIALLY_PAID when 0 < paid < total', () => {
      expect(statusFor(1000, 400)).toBe('PARTIALLY_PAID');
      expect(statusFor('1000.00', '999.99')).toBe('PARTIALLY_PAID');
      expect(statusFor(1000, 0.01)).toBe('PARTIALLY_PAID');
    });

    it('returns PAID when paid >= total', () => {
      expect(statusFor(1000, 1000)).toBe('PAID');
      expect(statusFor(1000, 1500)).toBe('PAID');
      expect(statusFor('1000.00', '1000.00')).toBe('PAID');
    });
  });

  describe('paidAmount', () => {
    it('queries only ACTIVE payments and formats the result as a 2-decimal string', async () => {
      const mockTx = {
        query: vi.fn().mockImplementation((sql: string, params: any[]) => {
          expect(sql).toContain("status = 'ACTIVE'");
          expect(params).toEqual([42]);
          return [{ total: '650.00' }];
        }),
      };

      const result = await paidAmount(mockTx, 42);
      expect(result).toBe('650.00');
      expect(mockTx.query).toHaveBeenCalledTimes(1);
    });

    it('returns "0.00" if no active payments exist or result is null', async () => {
      const mockTx = {
        query: vi.fn().mockResolvedValue([{ total: null }]),
      };

      const result = await paidAmount(mockTx, 99);
      expect(result).toBe('0.00');
    });

    it('supports prisma aggregate transaction context', async () => {
      const mockPrismaTx = {
        payment: {
          aggregate: vi.fn().mockResolvedValue({ _sum: { amount: 350.5 } }),
        },
      };

      const result = await paidAmount(mockPrismaTx, '10');
      expect(result).toBe('350.50');
      expect(mockPrismaTx.payment.aggregate).toHaveBeenCalledWith({
        where: { invoiceId: 10n, status: 'ACTIVE' },
        _sum: { amount: true },
      });
    });
  });
});

