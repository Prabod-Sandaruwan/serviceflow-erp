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

describe('DashboardWidgets and States (FIN-014)', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    vi.clearAllMocks();
  });

  const authCtx = (role: 'STAFF' | 'MANAGER'): any => ({
    user: { id: 'u1', email: `${role.toLowerCase()}@test.com`, role },
    role, status: 'authenticated', login: vi.fn(), logout: vi.fn(),
    hasRole: (roles: string[]) => roles.includes(role),
  });

  const renderDashboard = (role: 'STAFF' | 'MANAGER') =>
    render(
      <MemoryRouter>
        <QueryClientProvider client={queryClient}>
          <AuthContext.Provider value={authCtx(role)}>
            <DashboardPage />
          </AuthContext.Provider>
        </QueryClientProvider>
      </MemoryRouter>
    );

  it('Test 1 (Loading State): renders loading skeletons/indicators for widgets', () => {
    vi.mocked(hooks.useDashboardSummary).mockReturnValue({ isLoading: true, isError: false } as any);
    renderDashboard('MANAGER');
    expect(screen.getAllByTestId('kpi-loading-skeleton').length).toBeGreaterThan(0);
  });

  it('Test 2 (Error State): renders error message and fallback UI', () => {
    vi.mocked(hooks.useDashboardSummary).mockReturnValue({
      isLoading: false, isError: true, error: new Error('Database connection failed'),
    } as any);
    renderDashboard('MANAGER');
    expect(screen.getByText('Failed to load dashboard data')).toBeInTheDocument();
    expect(screen.getByText('Database connection failed')).toBeInTheDocument();
    expect(screen.getAllByText('Error loading metric').length).toBeGreaterThan(0);
  });

  it('Test 3 (Empty State): renders empty state UI when data is null or empty', () => {
    vi.mocked(hooks.useDashboardSummary).mockReturnValue({
      isLoading: false, isError: false, data: { data: null },
    } as any);
    renderDashboard('MANAGER');
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('Test 4 (Staff Variant): hides financial widgets and renders only tasks and leads', () => {
    vi.mocked(hooks.useDashboardSummary).mockReturnValue({
      isLoading: false, isError: false,
      data: { data: { role: 'STAFF', tasks: { total: 8, todo: 3, inProgress: 3, done: 2 }, leadsCount: 4, quotationsCount: 2 } },
    } as any);
    renderDashboard('STAFF');
    expect(screen.getByText('Staff Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Tasks')).toBeInTheDocument();
    expect(screen.getByText('Leads')).toBeInTheDocument();
    expect(screen.getByText('Quotations')).toBeInTheDocument();
    expect(screen.queryByText('Revenue')).not.toBeInTheDocument();
    expect(screen.queryByText('Estimated profit')).not.toBeInTheDocument();
    expect(screen.queryByText('Payments Received')).not.toBeInTheDocument();
    expect(screen.queryByText('Expenses')).not.toBeInTheDocument();
  });
});
