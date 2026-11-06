import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PaymentHistoryTable } from './PaymentHistoryTable';
import * as paymentHooks from './paymentHooks';
import * as authProvider from '../auth/AuthProvider';
import { ToastProvider } from '../../components/ui/Toast';

vi.mock('../auth/AuthProvider', () => ({ useAuth: vi.fn() }));
vi.mock('./paymentHooks', () => ({
  useInvoicePayments: vi.fn(),
  useVoidPayment: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

describe('PaymentHistoryTable Component (PAY-014)', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  const mockPayments: paymentHooks.PaymentRecord[] = [
    {
      id: 'pay-1',
      invoiceId: 'inv-100',
      amount: '500.00',
      method: 'CASH',
      paymentDate: '2026-11-02',
      status: 'ACTIVE',
      createdAt: '2026-11-02T10:00:00Z',
    },
    {
      id: 'pay-2',
      invoiceId: 'inv-100',
      amount: '300.00',
      method: 'BANK_TRANSFER',
      reference: 'WIRE-99',
      paymentDate: '2026-11-03',
      status: 'VOIDED',
      voidReason: 'Mistaken duplicate entry',
      createdAt: '2026-11-03T10:00:00Z',
    },
  ];

  const renderTable = (payments = mockPayments, role = 'MANAGER') => {
    vi.mocked(authProvider.useAuth).mockReturnValue({ user: { id: 'u1', role } } as any);
    vi.mocked(paymentHooks.useInvoicePayments).mockReturnValue({
      data: { data: payments },
      isLoading: false,
    } as any);

    return render(
      <ToastProvider>
        <PaymentHistoryTable invoiceId="inv-100" />
      </ToastProvider>
    );
  };

  it('renders payment records with formatted amounts, methods and statuses', () => {
    renderTable();
    expect(screen.getByText('2026-11-02')).toBeInTheDocument();
    expect(screen.getByText('CASH')).toBeInTheDocument();
    expect(screen.getByText('$500.00')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();

    expect(screen.getByText('2026-11-03')).toBeInTheDocument();
    expect(screen.getByText('BANK TRANSFER')).toBeInTheDocument();
    expect(screen.getByText('WIRE-99')).toBeInTheDocument();
    expect(screen.getByText(/Mistaken duplicate entry/i)).toBeInTheDocument();
  });

  it('shows Void button for MANAGER only on ACTIVE payments', () => {
    renderTable(mockPayments, 'MANAGER');
    expect(screen.getByTestId('void-pay-btn-pay-1')).toBeInTheDocument();
    expect(screen.queryByTestId('void-pay-btn-pay-2')).not.toBeInTheDocument();
  });

  it('hides Void button completely for STAFF role', () => {
    renderTable(mockPayments, 'STAFF');
    expect(screen.queryByTestId('void-pay-btn-pay-1')).not.toBeInTheDocument();
    expect(screen.queryByTestId('void-pay-btn-pay-2')).not.toBeInTheDocument();
  });

  it('opens VoidPaymentDialog when Void button is clicked', () => {
    renderTable(mockPayments, 'ADMIN');
    fireEvent.click(screen.getByTestId('void-pay-btn-pay-1'));
    expect(screen.getByText(/Voiding this payment will reverse its contribution/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Reason for Voiding/i)).toBeInTheDocument();
  });
});
