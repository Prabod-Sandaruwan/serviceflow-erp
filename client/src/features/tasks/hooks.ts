import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import type { Task, TasksResponse, CreateTaskInput, UpdateTaskInput, TaskQueryParams } from './types';

const toQueryString = (params: TaskQueryParams = {}) => {
  const clean: Record<string, string> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && String(v).trim() !== '') {
      clean[k] = String(v).trim();
    }
  }
  const q = new URLSearchParams(clean).toString();
  return q ? `?${q}` : '';
};

export function useTasks(params: TaskQueryParams = {}) {
  const qs = toQueryString(params);
  return useQuery<TasksResponse>({
    queryKey: ['tasks', params],
    queryFn: () => api.get<TasksResponse>(`/tasks${qs}`),
  });
}

export function useProjectTasks(projectId?: string, params: TaskQueryParams = {}) {
  const qs = toQueryString(params);
  return useQuery<TasksResponse>({
    queryKey: ['tasks', 'project', projectId, params],
    queryFn: () => api.get<TasksResponse>(`/projects/${projectId}/tasks${qs}`),
    enabled: Boolean(projectId),
  });
}

export function useCreateTask(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTaskInput) =>
      api.post<{ data: Task }>(`/projects/${projectId}/tasks`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
    },
  });
}

export function useUpdateTask(projectId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskInput }) =>
      api.patch<{ data: Task }>(`/tasks/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      if (projectId) queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
    },
  });
}
