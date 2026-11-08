import { useContext } from 'react';
import { useMutation, QueryClientContext, QueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import type { Client } from './types';

const fallbackClient = new QueryClient();

export function useUpdateClient() {
  const ctx = useContext(QueryClientContext);
  const client = ctx || fallbackClient;
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; [key: string]: any }) =>
      api.patch<{ data: Client; duplicateWarning?: boolean }>(`/clients/${id}`, data),
    onSuccess: (_, vars) => {
      client.invalidateQueries({ queryKey: ['clients'] });
      client.invalidateQueries({ queryKey: ['clients-stats'] });
      client.invalidateQueries({ queryKey: ['client', vars.id] });
    },
  }, client);
}

export default useUpdateClient;
