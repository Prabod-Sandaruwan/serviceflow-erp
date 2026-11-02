import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ReasonDialog from './ReasonDialog';

describe('ReasonDialog Component (QUOT-015)', () => {
  it('enforces min 5 characters for rejection reason', async () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();

    render(<ReasonDialog isOpen={true} onClose={onClose} onConfirm={onConfirm} />);

    const textarea = screen.getByLabelText(/Rejection Reason/i);
    const submitBtn = screen.getByRole('button', { name: /Confirm Rejection/i });

    // Initially empty -> button disabled
    expect(submitBtn).toBeDisabled();

    // 4 characters -> button still disabled
    fireEvent.change(textarea, { target: { value: '1234' } });
    expect(submitBtn).toBeDisabled();

    // >= 5 characters -> button enabled and submits successfully
    fireEvent.change(textarea, { target: { value: 'Budget exceeded significantly' } });
    expect(submitBtn).not.toBeDisabled();

    fireEvent.click(submitBtn);
    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledWith('Budget exceeded significantly');
    });
  });

  it('triggers onClose when Cancel button is clicked', () => {
    const onClose = vi.fn();
    render(<ReasonDialog isOpen={true} onClose={onClose} onConfirm={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(onClose).toHaveBeenCalled();
  });
});
