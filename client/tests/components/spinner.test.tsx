import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Spinner } from '../../src/components/ui/Spinner';
import { Skeleton } from '../../src/components/states/Skeleton';
import { NetworkIndicator } from '../../src/layouts/NetworkIndicator';

describe('Spinner and Slow Network Loading Indicator', () => {
  it('renders standalone Spinner with role="status" and default label', () => {
    render(<Spinner />);
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders Spinner with custom label and inline mode', () => {
    render(<Spinner inline size="sm" label="Fetching updates..." />);
    const spinner = screen.getByRole('status', { name: 'Fetching updates...' });
    expect(spinner).toBeInTheDocument();
    expect(screen.getByText('Fetching updates...')).toBeInTheDocument();
  });

  it('renders Skeleton with animated spinner and progressbar role', () => {
    render(<Skeleton lines={2} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByText('Loading data...')).toBeInTheDocument();
  });

  it('NetworkIndicator stays hidden when no active network queries exist', () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <NetworkIndicator />
      </QueryClientProvider>,
    );
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
