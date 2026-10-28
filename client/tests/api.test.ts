import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api, clearCsrfToken } from '../src/lib/api';
import { ApiError } from '../src/lib/ApiError';

describe('api client', () => {
  const mockFetch = vi.fn();
  vi.stubGlobal('fetch', mockFetch);

  beforeEach(() => {
    vi.clearAllMocks();
    clearCsrfToken();
  });

  it('GET fetches with credentials', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: { message: 'ok' } }),
    });

    const res = await api.get<{ success: boolean; data: { message: string } }>('/test');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/test'),
      expect.objectContaining({ credentials: 'include', method: 'GET' }),
    );
    expect(res).toEqual({ success: true, data: { message: 'ok' } });
  });

  it('POST fetches CSRF token before first mutation, then sets header', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: { csrfToken: 'mock-csrf-token-123' } }),
    });
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({ success: true }),
    });

    await api.post('/test', { name: 'item' });
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch.mock.calls[0][0]).toContain('/auth/csrf');
    expect(mockFetch.mock.calls[1][1]).toEqual(
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        headers: expect.objectContaining({
          'X-CSRF-Token': 'mock-csrf-token-123',
          'Content-Type': 'application/json',
        }),
      }),
    );
  });

  it('Standard error parsing maps body to ApiError instance', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: async () => ({
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Invalid payload',
          details: [{ field: 'email', message: 'Required' }],
          requestId: 'req-abc-123',
        },
      }),
    });

    try {
      await api.get('/bad-request');
      expect.unreachable('Should have thrown ApiError');
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      const apiErr = err as ApiError;
      expect(apiErr.status).toBe(400);
      expect(apiErr.code).toBe('VALIDATION_FAILED');
      expect(apiErr.message).toBe('Invalid payload');
      expect(apiErr.details).toEqual([{ field: 'email', message: 'Required' }]);
      expect(apiErr.requestId).toBe('req-abc-123');
    }
  });
});
