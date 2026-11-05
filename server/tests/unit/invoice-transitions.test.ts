import { describe, it, expect } from 'vitest';
import { assertEditable, assertCancellable } from '../../src/modules/invoices/invoices.guard';

describe('Invoice Transitions and Guards (INV-010)', () => {
  it('Test 1: DRAFT invoice is editable', () => {
    expect(() => assertEditable({ status: 'DRAFT' })).not.toThrow();
  });

  it.each(['ISSUED', 'PARTIALLY_PAID', 'PAID', 'CANCELLED'])(
    'Test 2: %s invoice is immutable and throws INVOICE_IMMUTABLE',
    (status) => {
      expect(() => assertEditable({ status })).toThrowError(
        expect.objectContaining({
          statusCode: 409,
          code: 'INVOICE_IMMUTABLE',
        })
      );
    }
  );

  it.each(['DRAFT', 'ISSUED'])(
    'Test 3: Cancellation is valid for %s invoice',
    (status) => {
      expect(() => assertCancellable({ status })).not.toThrow();
    }
  );

  it.each(['PARTIALLY_PAID', 'PAID'])(
    'Test 4: Cancellation throws INVOICE_HAS_PAYMENTS for %s invoice',
    (status) => {
      expect(() => assertCancellable({ status })).toThrowError(
        expect.objectContaining({
          statusCode: 409,
          code: 'INVOICE_HAS_PAYMENTS',
        })
      );
    }
  );

  it('Test 5: Cancellation throws ALREADY_CANCELLED for CANCELLED invoice', () => {
    expect(() => assertCancellable({ status: 'CANCELLED' })).toThrowError(
      expect.objectContaining({
        statusCode: 409,
        code: 'ALREADY_CANCELLED',
      })
    );
  });
});
