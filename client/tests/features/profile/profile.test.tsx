import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RequireAuth } from '../../../src/app/guards';
import ChangePassword from '../../../src/features/profile/ChangePassword';
import { useAuth } from '../../../src/features/auth/AuthProvider';
import { api } from '../../../src/lib/api';
import { ToastProvider } from '../../../src/components/ui/Toast';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<any>('react-router-dom');
  return {
    ...actual,
    Navigate: (props: any) => {
      mockNavigate(props);
      return <div data-testid="navigate">{props.to}</div>;
    },
    useLocation: () => ({ pathname: '/dashboard' }),
  };
});

vi.mock('../../../src/features/auth/AuthProvider', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../../src/lib/api', () => ({
  api: {
    patch: vi.fn(),
    post: vi.fn(),
  },
}));

describe('Profile and ChangePassword', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('RequireAuth redirects to /profile/password when mustChangePassword is true', () => {
    vi.mocked(useAuth).mockReturnValue({
      status: 'authenticated',
      user: { id: '1', email: 'test@example.com', role: 'STAFF', mustChangePassword: true },
      role: 'STAFF',
      login: vi.fn(),
      logout: vi.fn(),
      hasRole: vi.fn(),
    });

    render(
      <MemoryRouter>
        <RequireAuth>
          <div>Protected Area</div>
        </RequireAuth>
      </MemoryRouter>,
    );

    expect(screen.getByTestId('navigate')).toHaveTextContent('/profile/password');
  });

  it('Password change form submits and shows success toast', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({ success: true });
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <MemoryRouter>
            <ChangePassword />
          </MemoryRouter>
        </ToastProvider>
      </QueryClientProvider>,
    );

    fireEvent.change(screen.getByLabelText('Current Password'), { target: { value: 'OldPassword@123' } });
    fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'NewPassword@2026' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'NewPassword@2026' } });

    fireEvent.click(screen.getByRole('button', { name: /Update Password/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/change-password', {
        currentPassword: 'OldPassword@123',
        newPassword: 'NewPassword@2026',
      });
    });

    expect(await screen.findByRole('status')).toHaveTextContent('Password updated successfully');
  });
});
