import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import type { Project, ProjectsResponse, CreateProjectInput } from './types';

export interface UseProjectsParams {
  status?: string;
  clientId?: string;
  search?: string;
  page?: number | string;
  pageSize?: number | string;
}

export function useProjects(params: UseProjectsParams = {}) {
  const clean: Record<string, string> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && String(v).trim() !== '') {
      clean[k] = String(v).trim();
    }
  }
  const q = new URLSearchParams(clean).toString();
  return useQuery<ProjectsResponse>({
    queryKey: ['projects', clean],
    queryFn: () => api.get<ProjectsResponse>(q ? `/projects?${q}` : '/projects'),
  });
}

export function useProject(id?: string) {
  return useQuery<{ data: Project }>({
    queryKey: ['projects', id],
    queryFn: () => api.get<{ data: Project }>(`/projects/${id}`),
    enabled: Boolean(id),
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProjectInput) =>
      api.post<{ data: Project }>('/projects', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
    },
  });
}

