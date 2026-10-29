import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import type { ClientsResponse } from './types';

export function useClients(params: Record<string, string | undefined>) {
  const cleanParams: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value.trim() !== '') {
      cleanParams[key] = value.trim();
    }
  }

  const queryParams = new URLSearchParams(cleanParams).toString();
  const endpoint = queryParams ? `/clients?${queryParams}` : '/clients';

  return useQuery<ClientsResponse>({
    queryKey: ['clients', cleanParams],
    queryFn: () => api.get<ClientsResponse>(endpoint),
  });
}
