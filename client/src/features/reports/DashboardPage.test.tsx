import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthContext } from '../auth/AuthProvider';
import { DashboardPage } from './DashboardPage';
import * as hooks from './hooks';

vi.mock('./hooks', async () => ({
  ...(await vi.importActual('./hooks')),
  useDashboardSummary: vi.fn(),
}));

describe('DashboardPage Component (FIN-012)', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    vi.clearAllMocks();
  });

  const createAuth = (role: 'STAFF' | 'MANAGER'): any => ({
    user: { id: '1', email: `${role.toLowerCase()}@test.com`, role },
    role, status: 'authenticated', login: vi.fn(), logout: vi.fn(),
    hasRole: (roles: string[]) => roles.includes(role),
  });

  it('Test 1 (Admin/Manager): renders financial metrics and Estimated profit with dynamic mock values', () => {
    vi.mocked(hooks.useDashboardSummary).mockReturnValue({
      data: {
        data: {
          role: 'MANAGER',
          counts: { activeClients: 15, activeProjects: 8, milestones: 12, tasks: { total: 20, todo: 5, inProgress: 10, done: 5, overdue: 2 } },
          financials: {
            revenue: '125000.00', paymentsReceived: '75000.00', outstanding: '50000.00',
            overdueOutstanding: '15000.00', expenses: '35000.00', estimatedProfit: '90000.00',
          },
        },
      },
      isLoading: false, isError: false,
    } as any);

    render(
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          <AuthContext.Provider value={createAuth('MANAGER')}>
            <DashboardPage />
          </AuthContext.Provider>
        </QueryClientProvider>
      </MemoryRouter>
    );

    expect(screen.getByText('Estimated profit')).toBeInTheDocument();
    expect(screen.getAllByText('$90,000.00').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getAllByText('$125,000.00').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Payments Received')).toBeInTheDocument();
    expect(screen.getAllByText('$75,000.00').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Outstanding')).toBeInTheDocument();
    expect(screen.getAllByText('$50,000.00').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Expenses')).toBeInTheDocument();
    expect(screen.getAllByText('$35,000.00').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Active Clients')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('Test 2 (Staff): renders staff tasks and leads, hides all financial metrics', () => {
    vi.mocked(hooks.useDashboardSummary).mockReturnValue({
      data: {
        data: { role: 'STAFF', tasks: { total: 7, todo: 3, inProgress: 2, done: 2 }, leadsCount: 4, quotationsCount: 2 },
      },
      isLoading: false, isError: false,
    } as any);

    render(
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          <AuthContext.Provider value={createAuth('STAFF')}>
            <DashboardPage />
          </AuthContext.Provider>
        </QueryClientProvider>
      </MemoryRouter>
    );

    expect(screen.getByText('Tasks')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('Leads')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();

    expect(screen.queryByText('Revenue')).not.toBeInTheDocument();
    expect(screen.queryByText('Estimated profit')).not.toBeInTheDocument();
    expect(screen.queryByText('Payments Received')).not.toBeInTheDocument();
    expect(screen.queryByText('Expenses')).not.toBeInTheDocument();
  });
});
