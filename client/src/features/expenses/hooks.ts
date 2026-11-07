import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import type {
  Expense,
  ExpensesResponse,
  CreateExpenseInput,
  UpdateExpenseInput,
  VoidExpenseInput,
} from './types';

export interface UseExpensesFilters {
  projectId?: string;
  category?: string;
  from?: string;
  to?: string;
  status?: string;
}

export function useExpenses(filters: UseExpensesFilters = {}) {
  const clean: Record<string, string> = {};
  for (const [k, v] of Object.entries(filters)) {
    if (v !== undefined && v !== null && String(v).trim() !== '' && v !== 'ALL') {
      clean[k] = String(v).trim();
    }
  }
  const q = new URLSearchParams(clean).toString();
  return useQuery<ExpensesResponse>({
    queryKey: ['expenses', clean],
    queryFn: () => api.get<ExpensesResponse>(q ? `/expenses?${q}` : '/expenses'),
  });
}

export function useCreateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateExpenseInput) =>
      api.post<{ data: Expense }>('/expenses', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses'] }),
  });
}

export function useUpdateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateExpenseInput }) =>
      api.patch<{ data: Expense }>(`/expenses/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses'] }),
  });
}

export function useVoidExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: VoidExpenseInput }) =>
      api.post<{ data: Expense }>(`/expenses/${id}/void`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses'] }),
  });
}
