import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProjectOverviewTab } from './ProjectOverviewTab';
import * as authProvider from '../auth/AuthProvider';
import type { Project } from './types';

vi.mock('../auth/AuthProvider', () => ({ useAuth: vi.fn() }));

const mockProject: Project = {
  id: 'p1',
  projectCode: 'PRJ-2026-0001',
  name: 'Acme Portal',
  status: 'ACTIVE',
  clientId: 'c1',
  budgetAmount: '50000.00',
  startDate: '2026-02-01',
  endDate: '2026-06-30',
  progressPercent: 60,
  client: { id: 'c1', displayName: 'Acme Corp' },
  milestones: [
    { id: 'm1', title: 'Phase 1', status: 'APPROVED' },
    { id: 'm2', title: 'Phase 2', status: 'IN_PROGRESS' },
    { id: 'm3', title: 'Phase 3', status: 'CANCELLED' },
  ],
  invoices: [{ id: 'inv-1' }],
  expenses: [{ id: 'exp-1' }, { id: 'exp-2' }],
  createdAt: '2026-01-01',
  updatedAt: '2026-01-02',
};

describe('ProjectOverviewTab Component (PROJ-013)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders overview details, progress bars and finance panels for ADMIN/MANAGER', () => {
    vi.mocked(authProvider.useAuth).mockReturnValue({ user: { id: '1', role: 'ADMIN' } } as any);
    render(<ProjectOverviewTab project={mockProject} />);

    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('$50,000.00')).toBeInTheDocument();
    expect(screen.getByText('60%')).toBeInTheDocument(); // Task progress
    expect(screen.getByText('50%')).toBeInTheDocument(); // 1 approved out of 2 non-cancelled milestones = 50%
    expect(screen.getByTestId('finance-panels')).toBeInTheDocument();
    expect(screen.getByText('1 Invoices')).toBeInTheDocument();
    expect(screen.getByText('2 Recorded Expenses')).toBeInTheDocument();
  });

  it('hides finance panels for STAFF role', () => {
    vi.mocked(authProvider.useAuth).mockReturnValue({ user: { id: '2', role: 'STAFF' } } as any);
    render(<ProjectOverviewTab project={mockProject} />);

    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('60%')).toBeInTheDocument();
    expect(screen.queryByTestId('finance-panels')).not.toBeInTheDocument();
  });
});

