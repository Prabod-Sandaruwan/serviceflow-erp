import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import type { Quotation, QuotationsResponse } from './types';

export interface UseQuotationsParams {
  status?: string;
  clientId?: string;
  createdBy?: string;
  pendingApproval?: boolean | string;
  page?: number | string;
  pageSize?: number | string;
  search?: string;
}

export function useQuotations(params: UseQuotationsParams = {}) {
  const clean: Record<string, string> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && String(v).trim() !== '') {
      clean[k] = String(v).trim();
    }
  }
  const q = new URLSearchParams(clean).toString();
  return useQuery<QuotationsResponse>({
    queryKey: ['quotations', clean],
    queryFn: () => api.get<QuotationsResponse>(q ? `/quotations?${q}` : '/quotations'),
  });
}

export function useQuotation(id?: string) {
  return useQuery<{ data: Quotation }>({
    queryKey: ['quotations', id],
    queryFn: () => api.get<{ data: Quotation }>(`/quotations/${id}`),
    enabled: Boolean(id),
  });
}

export function useCreateQuotation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post<{ data: Quotation }>('/quotations', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['quotations'] }),
  });
}

export function useUpdateQuotation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; [key: string]: any }) =>
      api.patch<{ data: Quotation }>(`/quotations/${id}`, data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      queryClient.invalidateQueries({ queryKey: ['quotations', vars.id] });
    },
  });
}
