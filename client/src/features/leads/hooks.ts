import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import type { Lead, LeadsResponse, FollowUp, FollowUpsResponse } from './types';

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

export function useConvertLead(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data?: { existingClientId?: string }) =>
      api.post<{ data: any }>(`/leads/${id}/convert`, data || {}),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['lead', id] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}

export function useFollowUps(leadId?: string) {
  return useQuery<FollowUpsResponse>({
    queryKey: ['follow-ups', leadId],
    queryFn: () => api.get<FollowUpsResponse>(leadId ? `/follow-ups?leadId=${leadId}` : '/follow-ups'),
    enabled: Boolean(leadId),
  });
}

export function useCreateFollowUp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post<{ data: FollowUp }>('/follow-ups', data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['follow-ups', vars.leadId] });
      queryClient.invalidateQueries({ queryKey: ['follow-ups'] });
    },
  });
}

export function useUpdateFollowUp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; [key: string]: any }) =>
      api.patch<{ data: FollowUp }>(`/follow-ups/${id}`, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['follow-ups', res.data.leadId] });
      queryClient.invalidateQueries({ queryKey: ['follow-ups'] });
    },
  });
}
