import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AppShell } from '../../src/layouts/AppShell';
import { useAuth } from '../../src/features/auth/AuthProvider';

vi.mock('../../src/features/auth/AuthProvider', () => ({
  useAuth: vi.fn(),
}));

const mockUseAuth = (role: string) => {
  vi.mocked(useAuth).mockReturnValue({
    user: { id: '1', email: `${role.toLowerCase()}@serviceflow.lk`, role },
    role,
    status: 'authenticated',
    login: vi.fn(),
    logout: vi.fn(),
    hasRole: (roles: string[]) => roles.includes(role),
  });
};

describe('AppShell layout component', () => {
  it("ADMIN sees 'Users' and 'Audit Logs'", () => {
    mockUseAuth('ADMIN');
    render(
      <MemoryRouter>
        <AppShell />
      </MemoryRouter>,
    );
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Audit Logs')).toBeInTheDocument();
  });

  it("MANAGER sees 'Employees' but NOT 'Users'", () => {
    mockUseAuth('MANAGER');
    render(
      <MemoryRouter>
        <AppShell />
      </MemoryRouter>,
    );
    expect(screen.getByText('Employees')).toBeInTheDocument();
    expect(screen.queryByText('Users')).not.toBeInTheDocument();
  });

  it("STAFF sees 'Clients' but NOT 'Finance Reports' or 'Employees'", () => {
    mockUseAuth('STAFF');
    render(
      <MemoryRouter>
        <AppShell />
      </MemoryRouter>,
    );
    expect(screen.getByText('Clients')).toBeInTheDocument();
    expect(screen.queryByText('Finance Reports')).not.toBeInTheDocument();
    expect(screen.queryByText('Employees')).not.toBeInTheDocument();
  });
});
