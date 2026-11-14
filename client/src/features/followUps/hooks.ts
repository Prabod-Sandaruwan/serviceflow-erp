import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import type { FollowUp } from '../leads/types';

export interface FollowUpsListResponse {
  data: FollowUp[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface UseAllFollowUpsParams {
  page?: number | string;
  limit?: number | string;
  status?: string;
  overdue?: boolean;
  leadId?: string;
}

export function useAllFollowUps(params: UseAllFollowUpsParams = {}) {
  const clean: Record<string, string> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && String(v).trim() !== '') {
      clean[k] = String(v).trim();
    }
  }
  const q = new URLSearchParams(clean).toString();
  return useQuery<FollowUpsListResponse>({
    queryKey: ['follow-ups', 'all', clean],
    queryFn: () => api.get<FollowUpsListResponse>(q ? `/follow-ups?${q}` : '/follow-ups'),
  });
}

export function useMarkFollowUpDone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch<{ data: FollowUp }>(`/follow-ups/${id}`, { status: 'DONE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['follow-ups'] });
      qc.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}
