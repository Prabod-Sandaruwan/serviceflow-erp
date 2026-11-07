import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ExpenseForm } from './ExpenseForm';
import * as projectHooks from '../projects/hooks';
import * as expenseHooks from './hooks';

vi.mock('./hooks', () => ({
  useCreateExpense: vi.fn(),
  useUpdateExpense: vi.fn(),
}));

vi.mock('../projects/hooks', () => ({
  useProjects: vi.fn(),
}));

describe('ExpenseForm Component (FIN-014)', () => {
  let queryClient: QueryClient;
  const mockCreate = vi.fn();
  const mockUpdate = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    vi.clearAllMocks();
    vi.mocked(expenseHooks.useCreateExpense).mockReturnValue({ mutateAsync: mockCreate, isPending: false } as any);
    vi.mocked(expenseHooks.useUpdateExpense).mockReturnValue({ mutateAsync: mockUpdate, isPending: false } as any);
  });

  const renderForm = (isOpen = true, initialData = null) =>
    render(
      <QueryClientProvider client={queryClient}>
        <ExpenseForm isOpen={isOpen} onClose={mockOnClose} initialData={initialData} />
      </QueryClientProvider>
    );

  it('Test 1 (Validation): asserts validation errors when amount is 0, -5, or empty', () => {
    vi.mocked(projectHooks.useProjects).mockReturnValue({
      data: { data: [{ id: 'p1', name: 'Project One', status: 'ACTIVE' }] },
    } as any);

    renderForm();

    const form = screen.getByRole('button', { name: /create expense/i }).closest('form')!;
    const projectSelect = screen.getByLabelText(/project/i);
    const descInput = screen.getByLabelText(/description/i);
    const amountInput = screen.getByLabelText(/amount/i);

    fireEvent.change(projectSelect, { target: { value: 'p1' } });
    fireEvent.change(descInput, { target: { value: 'Server hosting' } });

    // Empty amount
    fireEvent.change(amountInput, { target: { value: '' } });
    fireEvent.submit(form);
    expect(screen.getByText('Amount must be greater than 0')).toBeInTheDocument();
    expect(mockCreate).not.toHaveBeenCalled();

    // Zero amount
    fireEvent.change(amountInput, { target: { value: '0' } });
    fireEvent.submit(form);
    expect(screen.getByText('Amount must be greater than 0')).toBeInTheDocument();
    expect(mockCreate).not.toHaveBeenCalled();

    // Negative amount
    fireEvent.change(amountInput, { target: { value: '-5' } });
    fireEvent.submit(form);
    expect(screen.getByText('Amount must be greater than 0')).toBeInTheDocument();
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('Test 2 (Project Filter): excludes CANCELLED projects from the selection dropdown', () => {
    vi.mocked(projectHooks.useProjects).mockReturnValue({
      data: {
        data: [
          { id: 'p1', name: 'Active Project Alpha', status: 'ACTIVE' },
          { id: 'p2', name: 'Cancelled Project Beta', status: 'CANCELLED' },
          { id: 'p3', name: 'Completed Project Gamma', status: 'COMPLETED' },
        ],
      },
    } as any);

    renderForm();

    expect(screen.getByText('Active Project Alpha')).toBeInTheDocument();
    expect(screen.getByText('Completed Project Gamma')).toBeInTheDocument();
    expect(screen.queryByText('Cancelled Project Beta')).not.toBeInTheDocument();
  });
});
