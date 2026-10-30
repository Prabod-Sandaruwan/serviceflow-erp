import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import type { Lead, LeadsResponse } from './types';

export function useLeads(params: Record<string, string | undefined>) {
  const clean: Record<string, string> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v.trim() !== '') clean[k] = v.trim();
  }
  const q = new URLSearchParams(clean).toString();
  return useQuery<LeadsResponse>({
    queryKey: ['leads', clean],
    queryFn: () => api.get<LeadsResponse>(q ? `/leads?${q}` : '/leads'),
  });
}

export function useLead(id?: string) {
  return useQuery<{ data: Lead }>({
    queryKey: ['lead', id],
    queryFn: () => api.get<{ data: Lead }>(`/leads/${id}`),
    enabled: Boolean(id),
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post<{ data: Lead }>('/leads', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leads'] }),
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; [key: string]: any }) =>
      api.patch<{ data: Lead }>(`/leads/${id}`, data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead', vars.id] });
    },
  });
}
