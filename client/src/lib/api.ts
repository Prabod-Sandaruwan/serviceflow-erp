import { ApiError } from './ApiError';

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

let csrfToken: string | null = null;
let onUnauth: (() => void) | null = null;

export const setOnUnauthenticated = (cb: (() => void) | null) => {
  onUnauth = cb;
};

export const clearCsrfToken = () => {
  csrfToken = null;
};

async function fetchCsrf(): Promise<void> {
  const res = await fetch(`${BASE_URL}/auth/csrf`, { credentials: 'include' }).catch(() => null);
  const body = await res?.json().catch(() => null);
  csrfToken = body?.data?.csrfToken || body?.csrfToken || null;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  isRetry = false,
): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();
  const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

  if (isMutation && !csrfToken) await fetchCsrf();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };
  if (isMutation && csrfToken) headers['X-CSRF-Token'] = csrfToken;

  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
      credentials: 'include',
    });
  } catch (err: any) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(0, 'NETWORK_ERROR', err?.message || 'Network error: could not connect to server');
  }

  const body = res.status === 204 ? null : await res.json().catch(() => null);

  if (res.status === 401 && onUnauth && !path.includes('/auth/me') && !path.includes('/auth/login')) {
    onUnauth();
  }

  if (res.status === 403 && !isRetry) {
    const code = body?.error?.code || body?.code;
    if (code === 'CSRF_INVALID') {
      csrfToken = null;
      await fetchCsrf();
      return request<T>(endpoint, options, true);
    }
  }

  if (!res.ok) {
    const err = body?.error || body;
    throw new ApiError(
      res.status,
      err?.code || 'UNKNOWN_ERROR',
      err?.message || res.statusText || 'Request failed',
      err?.details,
      err?.requestId,
    );
  }

  return body as T;
}

const toBody = (body: unknown, opt?: RequestInit) =>
  opt?.body || (body !== undefined ? JSON.stringify(body) : undefined);

export const api = {
  get: <T>(endpoint: string, opt?: RequestInit) =>
    request<T>(endpoint, { ...opt, method: 'GET' }),
  post: <T>(endpoint: string, body?: unknown, opt?: RequestInit) =>
    request<T>(endpoint, { ...opt, method: 'POST', body: toBody(body, opt) }),
  put: <T>(endpoint: string, body?: unknown, opt?: RequestInit) =>
    request<T>(endpoint, { ...opt, method: 'PUT', body: toBody(body, opt) }),
  patch: <T>(endpoint: string, body?: unknown, opt?: RequestInit) =>
    request<T>(endpoint, { ...opt, method: 'PATCH', body: toBody(body, opt) }),
  delete: <T>(endpoint: string, opt?: RequestInit) =>
    request<T>(endpoint, { ...opt, method: 'DELETE' }),
};
