import { useContext } from 'react';
import { useQuery, QueryClientContext, QueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';

export interface TaskStatsData {
  todo: number;
  inProgress: number;
  done: number;
  cancelled: number;
  total: number;
}

const fallbackClient = new QueryClient();

export function useTaskStats() {
  const ctx = useContext(QueryClientContext);
  const client = ctx || fallbackClient;
  return useQuery<{ data: TaskStatsData }>(
    {
      queryKey: ['tasks-stats'],
      queryFn: () => api.get<{ data: TaskStatsData }>('/tasks/stats'),
      staleTime: 30000,
      enabled: Boolean(ctx),
    },
    client,
  );
}

export default useTaskStats;

