import { useContext } from 'react';
import { useQuery, QueryClientContext, QueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';

export interface ClientStatsData {
  total: number;
  active: number;
  corporate: number;
  individuals: number;
}

const fallbackClient = new QueryClient({ defaultOptions: { queries: { enabled: false, retry: false } } });

export function useClientStats() {
  const ctx = useContext(QueryClientContext);
  return useQuery<{ data: ClientStatsData }>({
    queryKey: ['clients-stats'],
    queryFn: () => api.get<{ data: ClientStatsData }>('/clients/stats'),
    enabled: Boolean(ctx),
  }, ctx || fallbackClient);
}

export default useClientStats;
