import { useQuery, useMutation } from '@tanstack/react-query';
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

export function useDownloadInvoicePdf() {
  return useMutation({
    mutationFn: ({ id, filename }: { id: string; filename?: string }) =>
      downloadInvoicePdf(id, filename),
  });
}
