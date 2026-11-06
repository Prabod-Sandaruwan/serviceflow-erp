import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PaymentDialog } from './PaymentDialog';
import * as paymentHooks from './paymentHooks';
import { ToastProvider } from '../../components/ui/Toast';

vi.mock('./paymentHooks', () => ({
  useRecordPayment: vi.fn(),
}));

describe('PaymentDialog Component (PAY-014)', () => {
  const mutateAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(paymentHooks.useRecordPayment).mockReturnValue({
      mutateAsync,
      isPending: false,
    } as any);
  });

  const renderDialog = (balance = '500.00', isOpen = true) => {
    const onClose = vi.fn();
    const onSuccess = vi.fn();
    render(
      <ToastProvider>
        <PaymentDialog
          isOpen={isOpen}
          onClose={onClose}
          invoiceId="inv-123"
          balance={balance}
          issueDate="2026-11-01"
          onSuccess={onSuccess}
        />
      </ToastProvider>
    );
    return { onClose, onSuccess };
  };

  it('renders prefilled balance and calls mutateAsync on valid submission', async () => {
    mutateAsync.mockResolvedValueOnce({ data: { id: 'p1' } });
    const { onClose, onSuccess } = renderDialog('500.00');

    expect(screen.getByDisplayValue('500.00')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Record Payment/i }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        invoiceId: 'inv-123',
        data: expect.objectContaining({ amount: '500.00', method: 'CASH' }),
      });
    });
    expect(onSuccess).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it('validates reference requirement for CARD/BANK_TRANSFER payments', async () => {
    renderDialog('300.00');
    fireEvent.change(screen.getByLabelText(/Payment Method/i), { target: { value: 'BANK_TRANSFER' } });

    expect(screen.getByLabelText(/Transaction Reference/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Record Payment/i }));

    expect(await screen.findByText(/Reference is required for bank transfer and card payments/i)).toBeInTheDocument();
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it('validates overpayment against remaining invoice balance', async () => {
    renderDialog('250.00');
    const amountInput = screen.getByLabelText(/Amount/i);
    fireEvent.change(amountInput, { target: { value: '300.00' } });
    fireEvent.click(screen.getByRole('button', { name: /Record Payment/i }));

    expect(await screen.findByText(/Amount cannot exceed balance of 250.00/i)).toBeInTheDocument();
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it('closes dialog on cancel button click', () => {
    const { onClose } = renderDialog();
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(onClose).toHaveBeenCalled();
  });
});
