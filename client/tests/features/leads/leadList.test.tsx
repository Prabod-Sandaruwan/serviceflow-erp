import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import LeadList from '../../../src/features/leads/LeadList';
import * as leadHooks from '../../../src/features/leads/hooks';
import * as authProvider from '../../../src/features/auth/AuthProvider';

vi.mock('../../../src/features/leads/hooks', () => ({
  useLeads: vi.fn(),
}));

vi.mock('../../../src/features/auth/AuthProvider', () => ({
  useAuth: vi.fn(),
}));

describe('LeadList Component (CRM-011)', () => {
  const dummyLeads = [
    { id: '1', title: 'Solar Project', status: 'NEW', expectedValue: 15000, ownerId: '10', owner: { id: '10', email: 'staff@example.com', fullName: 'Staff One' } },
    { id: '2', title: 'HVAC Contract', status: 'QUALIFIED', expectedValue: 28000, ownerId: '11', owner: { id: '11', email: 'mgr@example.com', fullName: 'Manager Two' } },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(authProvider.useAuth).mockReturnValue({ user: { id: '10', role: 'STAFF', email: 'staff@example.com' } } as any);
    vi.mocked(leadHooks.useLeads).mockReturnValue({
      isLoading: false, isError: false, data: { data: dummyLeads, meta: { page: 1, limit: 10, total: 2, totalPages: 1 } }, refetch: vi.fn(),
    } as any);
  });

  it('renders lead list with columns, data rows, status badges, and action links', () => {
    render(<MemoryRouter><LeadList /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: /Leads/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /\+ New Lead/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search leads/i)).toBeInTheDocument();
    expect(screen.getByText('Solar Project')).toBeInTheDocument();
    expect(screen.getByText('$15,000')).toBeInTheDocument();
    expect(screen.getAllByText('New').length).toBeGreaterThan(0);
    expect(screen.getByText('HVAC Contract')).toBeInTheDocument();
    expect(screen.getByText('$28,000')).toBeInTheDocument();
    expect(screen.getAllByText('Qualified').length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: /View/i })).toHaveLength(2);
  });

  it('hides Owner filter when logged in user is STAFF, and shows for ADMIN', () => {
    const { unmount } = render(<MemoryRouter><LeadList /></MemoryRouter>);
    expect(screen.queryByPlaceholderText(/Filter by Owner ID/i)).not.toBeInTheDocument();
    unmount();

    vi.mocked(authProvider.useAuth).mockReturnValue({ user: { id: '1', role: 'ADMIN', email: 'admin@example.com' } } as any);
    render(<MemoryRouter><LeadList /></MemoryRouter>);
    expect(screen.getByPlaceholderText(/Filter by Owner ID/i)).toBeInTheDocument();
  });
});
