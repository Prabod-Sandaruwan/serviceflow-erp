import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CancelDialog from './CancelDialog';

describe('CancelDialog Component (INV-014)', () => {
  it('Test 1: disables submit button when reason is less than 5 characters', () => {
    const onConfirm = vi.fn(), onClose = vi.fn();
    render(<CancelDialog isOpen={true} onClose={onClose} onConfirm={onConfirm} />);

    const textarea = screen.getByLabelText(/Cancellation Reason/i);
    const submitBtn = screen.getByRole('button', { name: /Confirm Cancellation/i });

    expect(submitBtn).toBeDisabled();
    fireEvent.change(textarea, { target: { value: 'four' } });
    expect(submitBtn).toBeDisabled();

    fireEvent.change(textarea, { target: { value: 'Valid reason' } });
    expect(submitBtn).not.toBeDisabled();
  });

  it('Test 2: displays error when onConfirm rejects with INVOICE_HAS_PAYMENTS 409 error', async () => {
    const onConfirm = vi.fn().mockRejectedValue(
      new Error('INVOICE_HAS_PAYMENTS: Cannot cancel invoice with payments')
    );
    const onClose = vi.fn();

    render(<CancelDialog isOpen={true} onClose={onClose} onConfirm={onConfirm} />);
    const textarea = screen.getByLabelText(/Cancellation Reason/i);
    const submitBtn = screen.getByRole('button', { name: /Confirm Cancellation/i });

    fireEvent.change(textarea, { target: { value: 'Cancel due to rework' } });
    expect(submitBtn).not.toBeDisabled();

    fireEvent.click(submitBtn);
    await waitFor(() => expect(onConfirm).toHaveBeenCalledWith('Cancel due to rework'));
    expect(await screen.findByRole('alert')).toHaveTextContent(/INVOICE_HAS_PAYMENTS/i);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('Test 3: triggers onClose when Cancel button is clicked', () => {
    const onClose = vi.fn();
    render(<CancelDialog isOpen={true} onClose={onClose} onConfirm={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /^Cancel$/i }));
    expect(onClose).toHaveBeenCalled();
  });
});
