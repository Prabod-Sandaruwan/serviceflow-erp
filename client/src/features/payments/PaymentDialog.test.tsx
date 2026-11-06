import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PaymentDialog } from './PaymentDialog';
import * as paymentHooks from './hooks';
import { ToastProvider } from '../../components/ui/Toast';

vi.mock('./hooks', () => ({
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
          invoice={{ id: 'inv-123', balance, issueDate: '2026-11-01' }}
          onSuccess={onSuccess}
        />
      </ToastProvider>
    );
    return { onClose, onSuccess };
  };

  it('Test 1 (Idempotency Header & Success): triggers mutation with Idempotency-Key and closes', async () => {
    mutateAsync.mockResolvedValueOnce({ data: { id: 'p1' } });
    const { onClose, onSuccess } = renderDialog('500.00');

    fireEvent.click(screen.getByRole('button', { name: /Record Payment/i }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          invoiceId: 'inv-123',
          idempotencyKey: expect.stringMatching(/^[0-9a-f-]{36}$|pay-\d+/),
          data: expect.objectContaining({ amount: '500.00', method: 'CASH' }),
        })
      );
    });
    expect(onSuccess).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it('Test 2 (Pending State): disables submit button when mutation isPending', () => {
    vi.mocked(paymentHooks.useRecordPayment).mockReturnValue({
      mutateAsync,
      isPending: true,
    } as any);

    renderDialog('500.00');
    const submitBtn = screen.getByRole('button', { name: /Recording/i });
    expect(submitBtn).toBeDisabled();
  });

  it('Test 3 (422 Error Mapping): displays server error message when mutation rejects', async () => {
    mutateAsync.mockRejectedValueOnce(new Error('Payment amount exceeds current balance of 500.00'));
    renderDialog('500.00');

    fireEvent.click(screen.getByRole('button', { name: /Record Payment/i }));

    expect(await screen.findByText(/Payment amount exceeds current balance of 500.00/i)).toBeInTheDocument();
  });
});
