import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';
import * as authProvider from './features/auth/AuthProvider';
import { router } from './app/router';

describe('App Component', () => {
  beforeEach(async () => {
    vi.restoreAllMocks();
    await router.navigate('/');
  });

  it('redirects unauthenticated user to login', async () => {
    render(<App />);
    expect(await screen.findByRole('button', { name: /Sign in/i })).toBeInTheDocument();
  });

  it('renders dashboard when authenticated', async () => {
    vi.spyOn(authProvider, 'useAuth').mockReturnValue({
      status: 'authenticated',
      user: { id: '1', email: 'admin@serviceflow.lk', role: 'ADMIN' },
      role: 'ADMIN',
      login: vi.fn(),
      logout: vi.fn(),
      hasRole: () => true,
    });

    render(<App />);
    expect(await screen.findByText(/Dashboard Page/i)).toBeInTheDocument();
  });
});
