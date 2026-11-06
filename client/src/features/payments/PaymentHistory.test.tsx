import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PaymentHistory } from './PaymentHistory';
import * as paymentHooks from './hooks';
import * as authProvider from '../auth/AuthProvider';
import { ToastProvider } from '../../components/ui/Toast';

vi.mock('../auth/AuthProvider', () => ({ useAuth: vi.fn() }));
vi.mock('./hooks', () => ({
  useInvoicePayments: vi.fn(),
  useVoidPayment: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

describe('PaymentHistory Component (PAY-014)', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  const activePayment: paymentHooks.PaymentRecord = {
    id: 'pay-1',
    invoiceId: 'inv-100',
    amount: '500.00',
    method: 'CASH',
    paymentDate: '2026-11-02',
    status: 'ACTIVE',
    createdAt: '2026-11-02T10:00:00Z',
  };

  const voidedPayment: paymentHooks.PaymentRecord = {
    id: 'pay-2',
    invoiceId: 'inv-100',
    amount: '300.00',
    method: 'BANK_TRANSFER',
    reference: 'WIRE-99',
    paymentDate: '2026-11-03',
    status: 'VOIDED',
    voidReason: 'Mistaken duplicate entry',
    createdAt: '2026-11-03T10:00:00Z',
  };

  const renderHistory = (payments = [activePayment], role = 'MANAGER') => {
    vi.mocked(authProvider.useAuth).mockReturnValue({ user: { id: 'u1', role } } as any);
    vi.mocked(paymentHooks.useInvoicePayments).mockReturnValue({
      data: { data: payments },
      isLoading: false,
    } as any);

    return render(
      <ToastProvider>
        <PaymentHistory invoiceId="inv-100" />
      </ToastProvider>
    );
  };

  it('Test 1 (Staff Void Visibility): STAFF user cannot see Void button on ACTIVE payment', () => {
    renderHistory([activePayment], 'STAFF');
    expect(screen.queryByRole('button', { name: /Void/i })).not.toBeInTheDocument();
    expect(screen.queryByTestId('void-pay-btn-pay-1')).not.toBeInTheDocument();
  });

  it('Test 2 (Manager Void Visibility): MANAGER user can see Void button on ACTIVE payment', () => {
    renderHistory([activePayment], 'MANAGER');
    expect(screen.getByRole('button', { name: /Void/i })).toBeInTheDocument();
    expect(screen.getByTestId('void-pay-btn-pay-1')).toBeInTheDocument();
  });

  it('Test 3 (Voided Row Rendering): renders void_reason and strike-through styling on VOIDED payment', () => {
    renderHistory([voidedPayment], 'MANAGER');
    expect(screen.getByText(/Mistaken duplicate entry/i)).toBeInTheDocument();
    const amountEl = screen.getByText('$300.00');
    expect(amountEl).toBeInTheDocument();
    expect(amountEl.className).toContain('line-through');
    expect(screen.queryByRole('button', { name: /Void/i })).not.toBeInTheDocument();
  });
});
