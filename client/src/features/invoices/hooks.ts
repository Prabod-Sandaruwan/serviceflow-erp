import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import type { Invoice, InvoicesResponse } from './types';

export interface UseInvoicesParams {
  status?: string;
  clientId?: string;
  projectId?: string;
  overdue?: boolean | string;
  from?: string;
  to?: string;
  page?: number | string;
  pageSize?: number | string;
}

export function useInvoices(params: UseInvoicesParams = {}) {
  const clean: Record<string, string> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && String(v).trim() !== '') {
      clean[k] = String(v).trim();
    }
  }
  const q = new URLSearchParams(clean).toString();
  return useQuery<InvoicesResponse>({
    queryKey: ['invoices', clean],
    queryFn: () => api.get<InvoicesResponse>(q ? `/invoices?${q}` : '/invoices'),
  });
}

export function useInvoice(id?: string) {
  return useQuery<{ data: Invoice }>({
    queryKey: ['invoices', id],
    queryFn: () => api.get<{ data: Invoice }>(`/invoices/${id}`),
    enabled: Boolean(id),
  });
}

export const downloadInvoicePdf = async (id: string, filename = 'invoice.pdf') => {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
  const res = await fetch(`${BASE_URL}/invoices/${id}/pdf`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to download invoice PDF');
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

export function useCreateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post<{ data: Invoice }>('/invoices', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invoices'] }),
  });
}

export function useUpdateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; [key: string]: any }) =>
      api.patch<{ data: Invoice }>(`/invoices/${id}`, data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['invoices'] });
      qc.invalidateQueries({ queryKey: ['invoices', vars.id] });
    },
  });
}

export function useIssueInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; issueDate: string; dueDate: string }) =>
      api.post<{ data: Invoice }>(`/invoices/${id}/issue`, data),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['invoices'] });
      qc.invalidateQueries({ queryKey: ['invoices', vars.id] });
    },
  });
}

export function useCancelInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.post<{ data: Invoice }>(`/invoices/${id}/cancel`, { reason }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['invoices'] });
      qc.invalidateQueries({ queryKey: ['invoices', vars.id] });
    },
  });
}
