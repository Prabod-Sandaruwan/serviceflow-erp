import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import type { DashboardSummaryResponse } from './types';

export function useDashboardSummary(from?: string, to?: string) {
  const clean: Record<string, string> = {};
  if (from && from.trim() !== '') clean.from = from.trim();
  if (to && to.trim() !== '') clean.to = to.trim();
  const q = new URLSearchParams(clean).toString();

  return useQuery<DashboardSummaryResponse>({
    queryKey: ['dashboard-summary', clean],
    queryFn: () =>
      api.get<DashboardSummaryResponse>(
        q ? `/dashboard/summary?${q}` : '/dashboard/summary'
      ),
  });
}

export * from './types';
