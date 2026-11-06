import { describe, it, expect } from 'vitest';
import { recordPaymentSchema, voidPaymentSchema } from '../../src/modules/payments/payments.schemas';
import { formatPayment } from '../../src/modules/payments/payments.formatter';

describe('Payment Schemas & Formatter Unit Tests (PAY-009)', () => {
  it('validates valid cash payment and formats amount', () => {
    const res = recordPaymentSchema.safeParse({ amount: '150.5', method: 'CASH', date: '2026-11-01' });
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.amount).toBe('150.50');
      expect(res.data.method).toBe('CASH');
    }
  });

  it('rejects bank transfer or card without reference', () => {
    const bankRes = recordPaymentSchema.safeParse({ amount: '100.00', method: 'BANK_TRANSFER', date: '2026-11-01' });
    expect(bankRes.success).toBe(false);

    const cardRes = recordPaymentSchema.safeParse({ amount: '100.00', method: 'CARD', date: '2026-11-01', reference: '' });
    expect(cardRes.success).toBe(false);

    const validBank = recordPaymentSchema.safeParse({
      amount: '100.00', method: 'BANK_TRANSFER', date: '2026-11-01', reference: 'TRX-123',
    });
    expect(validBank.success).toBe(true);
  });

  it('rejects invalid amounts: non-positive, > 2 decimals, or non-numeric', () => {
    expect(recordPaymentSchema.safeParse({ amount: '0', method: 'CASH', date: '2026-11-01' }).success).toBe(false);
    expect(recordPaymentSchema.safeParse({ amount: '-50.00', method: 'CASH', date: '2026-11-01' }).success).toBe(false);
    expect(recordPaymentSchema.safeParse({ amount: '10.555', method: 'CASH', date: '2026-11-01' }).success).toBe(false);
    expect(recordPaymentSchema.safeParse({ amount: 'abc', method: 'CASH', date: '2026-11-01' }).success).toBe(false);
  });

  it('rejects future payment dates', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);
    const res = recordPaymentSchema.safeParse({
      amount: '100.00', method: 'CASH', date: futureDate.toISOString().slice(0, 10),
    });
    expect(res.success).toBe(false);
  });

  it('validates voidPaymentSchema reason requirements', () => {
    expect(voidPaymentSchema.safeParse({ reason: '1234' }).success).toBe(false);
    expect(voidPaymentSchema.safeParse({ reason: '   ' }).success).toBe(false);
    expect(voidPaymentSchema.safeParse({ reason: 'a'.repeat(501) }).success).toBe(false);
    const valid = voidPaymentSchema.safeParse({ reason: 'Valid void reason here' });
    expect(valid.success).toBe(true);
    if (valid.success) expect(valid.data.reason).toBe('Valid void reason here');
  });

  it('formatPayment formats payment object correctly', () => {
    const formatted = formatPayment({
      id: 10n, invoiceId: 20n, amount: 250, method: 'CARD',
      paymentDate: new Date('2026-11-01T10:00:00Z'), status: 'ACTIVE', recordedBy: 1n,
    });
    expect(formatted.id).toBe('10');
    expect(formatted.invoiceId).toBe('20');
    expect(formatted.amount).toBe('250.00');
    expect(formatted.paymentDate).toBe('2026-11-01');
    expect(formatted.status).toBe('ACTIVE');
  });
});
