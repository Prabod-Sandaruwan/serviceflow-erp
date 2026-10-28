import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { RequireAuth, RequireRole } from '../../src/app/guards';
import { useAuth } from '../../src/features/auth/AuthProvider';

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

vi.mock('../../src/features/auth/AuthProvider', () => ({
  useAuth: vi.fn(),
}));

describe('Route Guards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('RequireAuth redirects to /login when unauthenticated', () => {
    vi.mocked(useAuth).mockReturnValue({
      status: 'unauthenticated',
      user: null,
      role: null,
      login: vi.fn(),
      logout: vi.fn(),
      hasRole: vi.fn(),
    });

    render(
      <MemoryRouter>
        <RequireAuth>
          <div>Protected Content</div>
        </RequireAuth>
      </MemoryRouter>,
    );

    expect(screen.getByTestId('navigate')).toHaveTextContent('/login');
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('RequireRole renders UnauthorisedPage when role is denied', () => {
    vi.mocked(useAuth).mockReturnValue({
      status: 'authenticated',
      user: { id: '1', email: 'staff@serviceflow.lk', role: 'STAFF' },
      role: 'STAFF',
      login: vi.fn(),
      logout: vi.fn(),
      hasRole: (roles: string[]) => roles.includes('STAFF'),
    });

    render(
      <MemoryRouter>
        <RequireRole roles={['ADMIN']}>
          <div>Admin Only</div>
        </RequireRole>
      </MemoryRouter>,
    );

    expect(screen.getByText(/403 - Access Denied/i)).toBeInTheDocument();
    expect(screen.queryByText('Admin Only')).not.toBeInTheDocument();
  });

  it('RequireRole renders children when role is allowed', () => {
    vi.mocked(useAuth).mockReturnValue({
      status: 'authenticated',
      user: { id: '1', email: 'admin@serviceflow.lk', role: 'ADMIN' },
      role: 'ADMIN',
      login: vi.fn(),
      logout: vi.fn(),
      hasRole: (roles: string[]) => roles.includes('ADMIN'),
    });

    render(
      <MemoryRouter>
        <RequireRole roles={['ADMIN']}>
          <div>Admin Only</div>
        </RequireRole>
      </MemoryRouter>,
    );

    expect(screen.getByText('Admin Only')).toBeInTheDocument();
    expect(screen.queryByText(/403 - Access Denied/i)).not.toBeInTheDocument();
  });
});
