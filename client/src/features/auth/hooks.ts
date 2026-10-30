import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, clearCsrfToken } from '../../lib/api';
import type { User, LoginInput } from './types';

export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      try {
        const res = await api.get<{ data?: User } | User>('/auth/me');
        return (res as any)?.data !== undefined ? (res as any).data : (res as User);
      } catch (e: any) {
        if (e?.status === 401) return null;
        throw e;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: LoginInput) => api.post<User>('/auth/login', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['me'] }),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post('/auth/logout'),
    onSuccess: () => {
      queryClient.setQueryData(['me'], null);
      clearCsrfToken();
    },
  });
}
