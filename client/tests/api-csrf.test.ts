import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api, clearCsrfToken, setOnUnauthenticated } from '../src/lib/api';

describe('api client auth & csrf retry', () => {
  const mockFetch = vi.fn();
  vi.stubGlobal('fetch', mockFetch);

  beforeEach(() => {
    vi.clearAllMocks();
    clearCsrfToken();
    setOnUnauthenticated(null);
  });

  it('triggers onUnauthenticated callback on 401 response', async () => {
    const unauthSpy = vi.fn();
    setOnUnauthenticated(unauthSpy);

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: async () => ({ error: { code: 'UNAUTHORIZED', message: 'Expired' } }),
    });

    await expect(api.get('/profile')).rejects.toThrow();
    expect(unauthSpy).toHaveBeenCalledTimes(1);
  });

  it('refetches CSRF and retries once on 403 CSRF_INVALID', async () => {
    // 1. Initial CSRF fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: { csrfToken: 'stale-token' } }),
    });
    // 2. Mutation fails with 403 CSRF_INVALID
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      json: async () => ({ error: { code: 'CSRF_INVALID', message: 'Token invalid' } }),
    });
    // 3. Auto refetch CSRF
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: { csrfToken: 'fresh-token' } }),
    });
    // 4. Retried mutation succeeds
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true, retried: true }),
    });

    const res = await api.post<{ success: boolean; retried: boolean }>('/mutate');
    expect(res).toEqual({ success: true, retried: true });
    expect(mockFetch).toHaveBeenCalledTimes(4);
    expect(mockFetch.mock.calls[3][1]?.headers?.['X-CSRF-Token']).toBe('fresh-token');
  });
});
