import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppShell } from '../../layouts/AppShell';
import { AuthContext } from '../auth/AuthProvider';
import { ExpensesList } from './ExpensesList';
import * as hooks from './hooks';

vi.mock('./hooks', async () => {
  const actual: any = await vi.importActual('./hooks');
  return {
    ...actual,
    useExpenses: vi.fn(),
    useCreateExpense: () => ({ mutateAsync: vi.fn(), isPending: false }),
    useUpdateExpense: () => ({ mutateAsync: vi.fn(), isPending: false }),
    useVoidExpense: () => ({ mutateAsync: vi.fn(), isPending: false }),
  };
});

vi.mock('../projects/hooks', () => ({
  useProjects: () => ({ data: { data: [] } }),
}));

describe('Expenses Feature UI (FIN-011)', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    vi.clearAllMocks();
  });

  const createAuth = (role: 'STAFF' | 'MANAGER'): any => ({
    user: { id: '1', email: `${role.toLowerCase()}@test.com`, role, fullName: 'User' },
    role,
    status: 'authenticated',
    login: vi.fn(),
    logout: vi.fn(),
    hasRole: (roles: string[]) => roles.includes(role),
  });

  it('Test 1: does NOT show Expenses menu entry to STAFF', () => {
    render(
      <MemoryRouter>
        <AuthContext.Provider value={createAuth('STAFF')}>
          <AppShell />
        </AuthContext.Provider>
      </MemoryRouter>
    );
    expect(screen.queryByText('Expenses')).not.toBeInTheDocument();
  });

  it('Test 2: shows Expenses menu entry to MANAGER', () => {
    render(
      <MemoryRouter>
        <AuthContext.Provider value={createAuth('MANAGER')}>
          <AppShell />
        </AuthContext.Provider>
      </MemoryRouter>
    );
    expect(screen.getByText('Expenses')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^Expenses$/i, hidden: true })).toBeInTheDocument();
  });

  it('Test 3: applies strike-through and hides Edit/Void for VOIDED expenses', () => {
    vi.mocked(hooks.useExpenses).mockReturnValue({
      data: {
        data: [
          {
            id: 'exp-voided',
            projectId: '1',
            category: 'SOFTWARE_LICENSE',
            amount: '120.00',
            expenseDate: '2026-11-01',
            description: 'Voided tool',
            status: 'VOIDED',
          } as any,
        ],
      },
      isLoading: false,
    } as any);

    render(
      <QueryClientProvider client={queryClient}>
        <ExpensesList />
      </QueryClientProvider>
    );

    const amountCell = screen.getByTestId('expense-amount-exp-voided');
    expect(amountCell.className).toContain('line-through');
    expect(amountCell.className).toContain('text-gray-500');

    expect(screen.queryByTestId('edit-btn-exp-voided')).not.toBeInTheDocument();
    expect(screen.queryByTestId('void-btn-exp-voided')).not.toBeInTheDocument();
  });
});
