import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';

export function useUsers(page = 1, search = '') {
  return useQuery({
    queryKey: ['users', page, search],
    queryFn: async () => {
      const q = new URLSearchParams({ page: String(page), pageSize: '10' });
      if (search) q.set('search', search);
      return api.get<{ data: any[]; meta: any }>(`/users?${q.toString()}`);
    },
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post('/users', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string | number; [key: string]: any }) =>
      api.patch(`/users/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useResetPassword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, tempPassword }: { id: string | number; tempPassword: string }) =>
      api.post(`/users/${id}/reset-password`, { tempPassword }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
}

export function useEmployees(page = 1, search = '') {
  return useQuery({
    queryKey: ['employees', page, search],
    queryFn: async () => {
      const q = new URLSearchParams({ page: String(page), pageSize: '10' });
      if (search) q.set('search', search);
      return api.get<{ data: any[]; meta: any }>(`/employees?${q.toString()}`);
    },
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post('/employees', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employees'] }),
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string | number; [key: string]: any }) =>
      api.patch(`/employees/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employees'] }),
  });
}

export function useAuditLogs(filters: any) {
  return useQuery({
    queryKey: ['audit', filters],
    queryFn: async () => {
      const q = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([k, v]) => {
          if (v !== undefined && v !== null && v !== '') q.set(k, String(v));
        });
      }
      return api.get<{ data: any[]; meta: any }>(`/audit-logs?${q.toString()}`);
    },
  });
}
