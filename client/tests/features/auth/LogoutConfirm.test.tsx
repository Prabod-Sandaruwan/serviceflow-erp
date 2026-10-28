import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LogoutConfirm from '../../../src/features/auth/LogoutConfirm';
import { useAuth } from '../../../src/features/auth/AuthProvider';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('../../../src/features/auth/AuthProvider', () => ({
  useAuth: vi.fn(),
}));

describe('LogoutConfirm Component', () => {
  const mockLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      user: { id: '1', email: 'test@serviceflow.lk', role: 'ADMIN' },
      role: 'ADMIN',
      status: 'authenticated',
      login: vi.fn(),
      logout: mockLogout,
      hasRole: vi.fn(),
    });
  });

  it('renders sign out confirmation and user email', () => {
    render(<LogoutConfirm />);
    expect(screen.getByText('Confirm Sign Out')).toBeInTheDocument();
    expect(screen.getByText(/test@serviceflow.lk/i)).toBeInTheDocument();
  });

  it('cancels logout and navigates back', () => {
    render(<LogoutConfirm />);
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(mockNavigate).toHaveBeenCalledWith(-1);
    expect(mockLogout).not.toHaveBeenCalled();
  });

  it('confirms logout, calls logout(), and redirects to /login', async () => {
    mockLogout.mockResolvedValueOnce(undefined);
    render(<LogoutConfirm />);
    fireEvent.click(screen.getByRole('button', { name: /Log Out/i }));

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });
});
