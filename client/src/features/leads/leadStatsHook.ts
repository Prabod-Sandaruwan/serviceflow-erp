import { useContext } from 'react';
import { useQuery, QueryClientContext, QueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';

export interface LeadStatsData {
  totalValue: number;
  totalCount: number;
  convertedValue: number;
  convertedCount: number;
  activeValue: number;
  activeCount: number;
  lostValue: number;
  lostCount: number;
}

const fallbackClient = new QueryClient();

export function useLeadStats() {
  const ctx = useContext(QueryClientContext);
  const client = ctx || fallbackClient;
  return useQuery<{ data: LeadStatsData }>(
    {
      queryKey: ['leads-stats'],
      queryFn: () => api.get<{ data: LeadStatsData }>('/leads/stats'),
      staleTime: 30000,
      enabled: Boolean(ctx),
    },
    client,
  );
}

export default useLeadStats;
