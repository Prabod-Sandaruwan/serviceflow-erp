import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import type { Milestone } from './types';

export function useMilestones(projectId?: string) {
  return useQuery<{ data: Milestone[] }>({
    queryKey: ['milestones', projectId],
    queryFn: () => api.get<{ data: Milestone[] }>(`/projects/${projectId}/milestones`),
    enabled: Boolean(projectId),
  });
}

export function useApproveMilestone(projectId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<{ data: Milestone }>(`/milestones/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
    },
  });
}
