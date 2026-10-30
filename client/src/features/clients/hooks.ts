import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import type { Client, ClientsResponse } from './types';

export function useClients(params: Record<string, string | undefined>) {
  const clean: Record<string, string> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v.trim() !== '') clean[k] = v.trim();
  }
  const q = new URLSearchParams(clean).toString();
  return useQuery<ClientsResponse>({
    queryKey: ['clients', clean],
    queryFn: () => api.get<ClientsResponse>(q ? `/clients?${q}` : '/clients'),
  });
}

export function useClient(id?: string) {
  return useQuery<{ data: Client }>({
    queryKey: ['client', id],
    queryFn: () => api.get<{ data: Client }>(`/clients/${id}`),
    enabled: Boolean(id),
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post<{ data: Client; duplicateWarning?: boolean }>('/clients', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clients'] }),
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; [key: string]: any }) =>
      api.patch<{ data: Client; duplicateWarning?: boolean }>(`/clients/${id}`, data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client', vars.id] });
    },
  });
}
