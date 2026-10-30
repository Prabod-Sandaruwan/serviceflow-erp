import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Login from '../../../src/features/auth/Login';
import { useAuth } from '../../../src/features/auth/AuthProvider';
import { ApiError } from '../../../src/lib/ApiError';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<any>('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../../../src/features/auth/AuthProvider', () => ({
  useAuth: vi.fn(),
}));

describe('Login Component', () => {
  const mockLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      login: mockLogin,
      user: null,
      role: null,
      status: 'unauthenticated',
      logout: vi.fn(),
      hasRole: vi.fn(),
    });
  });

  it('autofocuses email input on mount', () => {
    render(<MemoryRouter><Login /></MemoryRouter>);
    expect(screen.getByLabelText('Email')).toHaveFocus();
  });

  it('displays 401 error message on invalid credentials', async () => {
    mockLogin.mockRejectedValueOnce(new ApiError(401, 'UNAUTHORIZED', 'Invalid creds'));
    render(<MemoryRouter><Login /></MemoryRouter>);

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret123' } });
    fireEvent.click(screen.getByRole('button', { name: /Sign in/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Email or password is incorrect.');
  });

  it('displays 429 rate limit error message', async () => {
    mockLogin.mockRejectedValueOnce(new ApiError(429, 'RATE_LIMITED', 'Rate limited'));
    render(<MemoryRouter><Login /></MemoryRouter>);

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret123' } });
    fireEvent.click(screen.getByRole('button', { name: /Sign in/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Too many attempts. Please try again later.');
  });

  it('navigates to /profile/password if mustChangePassword is true', async () => {
    mockLogin.mockResolvedValueOnce({ id: '1', mustChangePassword: true });
    render(<MemoryRouter><Login /></MemoryRouter>);

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'admin@serviceflow.lk' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /Sign in/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/profile/password', { replace: true });
    });
  });

  it('overrides /logout from path and navigates strictly to / on successful login', async () => {
    mockLogin.mockResolvedValueOnce({ id: '1', mustChangePassword: false });
    render(
      <MemoryRouter initialEntries={[{ pathname: '/login', state: { from: { pathname: '/logout' } } }]}>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'admin@serviceflow.lk' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /Sign in/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });
  });
});
