import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Login from '../../../src/features/auth/Login';
import { useAuth } from '../../../src/features/auth/AuthProvider';

vi.mock('../../../src/features/auth/AuthProvider', () => ({
  useAuth: vi.fn(),
}));

describe('Login Info Modals (Help, Security, Privacy, Terms)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      login: vi.fn(), user: null, role: null, status: 'unauthenticated',
      logout: vi.fn(), hasRole: vi.fn(),
    });
  });

  it('Test 1: clicking Help & Support opens modal and can be dismissed', () => {
    render(<MemoryRouter><Login /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: /help & support/i }));

    expect(screen.getByRole('heading', { name: 'Help & Support' })).toBeInTheDocument();
    expect(screen.getByText(/support@serviceflow.lk/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(screen.queryByRole('heading', { name: 'Help & Support' })).not.toBeInTheDocument();
  });

  it('Test 2: clicking Security & Trust opens security details modal', () => {
    render(<MemoryRouter><Login /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: /security & trust/i }));

    expect(screen.getByRole('heading', { name: 'Security & Trust Architecture' })).toBeInTheDocument();
    expect(screen.getByText(/256-bit TLS\/SSL/i)).toBeInTheDocument();
  });

  it('Test 3: clicking Privacy Policy opens privacy modal', () => {
    render(<MemoryRouter><Login /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: /privacy policy/i }));

    expect(screen.getByRole('heading', { name: 'Privacy Policy' })).toBeInTheDocument();
    expect(screen.getByText(/zero commercial sharing/i)).toBeInTheDocument();
  });

  it('Test 4: clicking Terms of Service opens terms modal', () => {
    render(<MemoryRouter><Login /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: /terms of service/i }));

    expect(screen.getByRole('heading', { name: 'Terms of Service' })).toBeInTheDocument();
    expect(screen.getByText(/authorized personnel only/i)).toBeInTheDocument();
  });

  it('Test 5: hash routing opens corresponding modal directly', () => {
    render(
      <MemoryRouter initialEntries={['/login#privacy']}>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: 'Privacy Policy' })).toBeInTheDocument();
  });
});
