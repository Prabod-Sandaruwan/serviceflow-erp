import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Profile from '../../../src/features/profile/Profile';
import { useAuth } from '../../../src/features/auth/AuthProvider';
import { api } from '../../../src/lib/api';
import { ToastProvider } from '../../../src/components/ui/Toast';

vi.mock('../../../src/features/auth/AuthProvider', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../../src/lib/api', () => ({
  api: {
    patch: vi.fn(),
    post: vi.fn(),
  },
}));

describe('Profile Page Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders profile card and handles edit modal', async () => {
    vi.mocked(useAuth).mockReturnValue({
      status: 'authenticated',
      user: {
        id: '1',
        email: 'admin@serviceflow.lk',
        role: 'ADMIN',
        fullName: 'Admin User',
        employeeId: '10',
      },
      role: 'ADMIN',
      login: vi.fn(),
      logout: vi.fn(),
      hasRole: vi.fn(),
    });

    const queryClient = new QueryClient();
    vi.mocked(api.patch).mockResolvedValueOnce({ success: true });

    render(
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <MemoryRouter>
            <Profile />
          </MemoryRouter>
        </ToastProvider>
      </QueryClientProvider>,
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/User Profile/i);
    expect(screen.getAllByText('admin@serviceflow.lk').length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: /Change Password/i })).toHaveAttribute('href', '/profile/password');

    fireEvent.click(screen.getByRole('button', { name: /Edit Profile/i }));
    expect(screen.getByText('Full Legal Name')).toBeInTheDocument();

    const input = screen.getByLabelText(/Full Legal Name/i);
    fireEvent.change(input, { target: { value: 'Updated Admin Name' } });
    fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));

    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith('/employees/10', { fullName: 'Updated Admin Name' });
    });
  });
});
