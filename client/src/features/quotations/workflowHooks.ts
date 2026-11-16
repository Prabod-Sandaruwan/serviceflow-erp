import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api, API_BASE_URL } from '../../lib/api';
import type { Quotation } from './types';

export const downloadQuotationPdf = async (id: string, filename = 'quotation.pdf') => {
  const res = await fetch(`${API_BASE_URL}/quotations/${id}/pdf`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to download quotation PDF');
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

export function useSubmitQuotation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<{ data: Quotation }>(`/quotations/${id}/submit`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quotations'] }),
  });
}

export function useApproveQuotation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<{ data: Quotation }>(`/quotations/${id}/approve`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quotations'] }),
  });
}

export function useRejectQuotation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.post<{ data: Quotation }>(`/quotations/${id}/reject`, { reason }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quotations'] }),
  });
}

export function useSendQuotation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<{ data: Quotation }>(`/quotations/${id}/send`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quotations'] }),
  });
}

export function useRespondQuotation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; outcome: 'ACCEPTED' | 'DECLINED'; date: string; note?: string }) =>
      api.post<{ data: Quotation }>(`/quotations/${id}/respond`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quotations'] }),
  });
}

export function useReviseQuotation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<{ data: Quotation }>(`/quotations/${id}/revise`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['quotations'] }),
  });
}
