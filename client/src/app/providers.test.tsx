import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Providers, ErrorBoundary } from './providers';
import { queryClient } from './queryClient';

const BuggyComponent = () => {
  throw new Error('Test error');
};

describe('UI-001: Providers & QueryClient', () => {
  it('configures queryClient with correct defaults', () => {
    const defaultOptions = queryClient.getDefaultOptions();
    expect(defaultOptions.queries?.staleTime).toBe(30000);

    const retryFn = defaultOptions.queries?.retry;
    expect(typeof retryFn).toBe('function');
    if (typeof retryFn === 'function') {
      expect(retryFn(0, { response: { status: 400 } } as any)).toBe(false);
      expect(retryFn(0, { response: { status: 401 } } as any)).toBe(false);
      expect(retryFn(0, { response: { status: 403 } } as any)).toBe(false);
      expect(retryFn(0, { response: { status: 404 } } as any)).toBe(false);
      expect(retryFn(0, { status: 422 } as any)).toBe(false);
      expect(retryFn(1, { response: { status: 500 } } as any)).toBe(true);
      expect(retryFn(3, { response: { status: 500 } } as any)).toBe(false);
    }
  });

  it('renders children wrapped in Providers successfully', () => {
    render(
      <Providers>
        <div>Provider Child Content</div>
      </Providers>,
    );
    expect(screen.getByText('Provider Child Content')).toBeInTheDocument();
  });

  it('ErrorBoundary renders fallback UI when a child crashes', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <BuggyComponent />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
    expect(screen.getByText(/Please refresh/i)).toBeInTheDocument();
    consoleSpy.mockRestore();
  });
});
