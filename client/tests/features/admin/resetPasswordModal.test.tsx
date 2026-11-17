import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ResetPasswordModal } from '../../../src/features/admin/ResetPasswordModal';
import * as adminHooks from '../../../src/features/admin/hooks';

vi.mock('../../../src/features/admin/hooks', () => ({
  useResetPassword: vi.fn(),
}));

describe('ResetPasswordModal Component', () => {
  const mutateAsync = vi.fn();
  const onClose = vi.fn();
  const mockUser = { id: 'u123', email: 'staff@serviceflow.lk' };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(adminHooks.useResetPassword).mockReturnValue({
      mutateAsync,
      isPending: false,
    } as any);
  });

  it('validates minimum 12 characters client-side before calling API', async () => {
    render(<ResetPasswordModal isOpen={true} onClose={onClose} user={mockUser} />);

    const input = screen.getByLabelText(/Temporary Password/i);
    fireEvent.change(input, { target: { value: 'short' } });
    fireEvent.click(screen.getByRole('button', { name: /Confirm Reset/i }));

    expect(await screen.findByText('Temporary password must be at least 12 characters.')).toBeInTheDocument();
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it('rejects temporary password matching the user email', async () => {
    render(<ResetPasswordModal isOpen={true} onClose={onClose} user={mockUser} />);

    const input = screen.getByLabelText(/Temporary Password/i);
    fireEvent.change(input, { target: { value: 'staff@serviceflow.lk' } });
    fireEvent.click(screen.getByRole('button', { name: /Confirm Reset/i }));

    expect(await screen.findByText('Password cannot be the same as the user email.')).toBeInTheDocument();
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it('successfully calls mutateAsync and closes modal on valid submission', async () => {
    mutateAsync.mockResolvedValueOnce({ success: true });
    render(<ResetPasswordModal isOpen={true} onClose={onClose} user={mockUser} />);

    const input = screen.getByLabelText(/Temporary Password/i);
    fireEvent.change(input, { target: { value: 'SecurePass@2026!' } });
    fireEvent.click(screen.getByRole('button', { name: /Confirm Reset/i }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({ id: 'u123', tempPassword: 'SecurePass@2026!' });
      expect(onClose).toHaveBeenCalled();
    });
  });
});
