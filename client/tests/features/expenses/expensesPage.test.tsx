import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ExpensesPage from '../../../src/pages/ExpensesPage';
import * as hooks from '../../../src/features/expenses/hooks';
import * as exportModule from '../../../src/features/expenses/exportExpenses';

vi.mock('../../../src/features/expenses/hooks', () => ({
  useExpenses: vi.fn(),
  useCreateExpense: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateExpense: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useVoidExpense: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

vi.mock('../../../src/features/projects/hooks', () => ({
  useProjects: () => ({
    data: { data: [{ id: '1', projectCode: 'PRJ-1', name: 'ERP System', status: 'ACTIVE' }] },
  }),
}));

describe('Redesigned ExpensesPage Component', () => {
  let queryClient: QueryClient;
  const mockExpenses = [
    { id: 'exp-1', projectId: '1', category: 'SOFTWARE_LICENSE', amount: '250.00', expenseDate: '2026-11-10', description: 'GitHub Enterprise', status: 'ACTIVE', supplier: 'GitHub' },
    { id: 'exp-2', projectId: '1', category: 'HOSTING_INFRASTRUCTURE', amount: '400.00', expenseDate: '2026-11-12', description: 'AWS Servers', status: 'ACTIVE', supplier: 'AWS' },
    { id: 'exp-3', projectId: '1', category: 'TRAVEL', amount: '50.00', expenseDate: '2026-11-05', description: 'Taxi to client', status: 'VOIDED' },
  ];

  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    vi.clearAllMocks();
    vi.mocked(hooks.useExpenses).mockReturnValue({
      data: { data: mockExpenses },
      isLoading: false,
    } as any);
  });

  const renderComponent = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ExpensesPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

  it('renders summary cards, breadcrumb, header buttons, and expense table rows', async () => {
    renderComponent();
    expect(screen.getByText('Operations & Delivery')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Expenses' })).toBeInTheDocument();
    expect(screen.getByTestId('add-expense-btn')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Export CSV/i })).toBeInTheDocument();

    expect(screen.getByText('TOTAL RECORDED')).toBeInTheDocument();
    expect(screen.getByText('$700.00')).toBeInTheDocument();
    expect(screen.getByText('ACTIVE & BILLABLE')).toBeInTheDocument();
    expect(screen.getByText('$650.00')).toBeInTheDocument();

    expect(screen.getByTestId('expense-row-exp-1')).toBeInTheDocument();
    expect(screen.getByTestId('expense-row-exp-2')).toBeInTheDocument();
    expect(screen.getByTestId('expense-row-exp-3')).toBeInTheDocument();
  });

  it('filters table rows dynamically when typing in search input', async () => {
    renderComponent();
    const searchInput = screen.getByPlaceholderText(/search description, supplier/i);
    fireEvent.change(searchInput, { target: { value: 'GitHub' } });

    expect(screen.getByText('GitHub Enterprise')).toBeInTheDocument();
    expect(screen.queryByText('AWS Servers')).not.toBeInTheDocument();
  });

  it('opens add expense modal when Add Expense button is clicked', async () => {
    renderComponent();
    fireEvent.click(screen.getByTestId('add-expense-btn'));
    expect(await screen.findByRole('button', { name: /create expense/i })).toBeInTheDocument();
  });

  it('calls downloadAllExpensesCsv when Export CSV button is clicked', async () => {
    const spyExport = vi.spyOn(exportModule, 'downloadAllExpensesCsv').mockResolvedValue(undefined as any);
    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: /Export CSV/i }));
    await waitFor(() => expect(spyExport).toHaveBeenCalledWith(mockExpenses));
  });
});

