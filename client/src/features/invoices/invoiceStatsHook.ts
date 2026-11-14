import { useContext } from 'react';
import { useQuery, QueryClientContext, QueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';

export interface InvoiceStatsData {
  totalInvoiced: number;
  totalCount: number;
  totalCollected: number;
  outstandingBalance: number;
  overdueAccounts: number;
  overdueCount: number;
}

const fallbackClient = new QueryClient();

export function useInvoiceStats() {
  const ctx = useContext(QueryClientContext);
  const client = ctx || fallbackClient;
  return useQuery<{ data: InvoiceStatsData }>(
    {
      queryKey: ['invoices-stats'],
      queryFn: () => api.get<{ data: InvoiceStatsData }>('/invoices/stats'),
      staleTime: 30000,
      enabled: Boolean(ctx),
    },
    client,
  );
}

export default useInvoiceStats;

