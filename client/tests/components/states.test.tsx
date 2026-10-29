import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { QueryBoundary } from '../../src/components/states/QueryBoundary';
import { ApiError } from '../../src/lib/ApiError';

describe('State components & QueryBoundary', () => {
  it('renders Skeleton when isLoading is true', () => {
    const query = {
      isLoading: true,
      isError: false,
      data: undefined,
      refetch: vi.fn(),
    };

    render(
      <QueryBoundary query={query}>
        <div>Content Loaded</div>
      </QueryBoundary>,
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.queryByText('Content Loaded')).not.toBeInTheDocument();
  });

  it('renders EmptyState when data is empty array', () => {
    const query = {
      isLoading: false,
      isError: false,
      data: [],
      refetch: vi.fn(),
    };

    render(
      <QueryBoundary query={query} emptyMessage="No clients found.">
        <div>Content Loaded</div>
      </QueryBoundary>,
    );

    expect(screen.getByText('No clients found.')).toBeInTheDocument();
    expect(screen.queryByText('Content Loaded')).not.toBeInTheDocument();
  });

  it('renders ErrorPanel displaying ApiError message for 400 error', () => {
    const err = new ApiError(400, 'VALIDATION_ERROR', 'Client name is required');
    const query = {
      isLoading: false,
      isError: true,
      error: err,
      data: undefined,
      refetch: vi.fn(),
    };

    render(
      <QueryBoundary query={query}>
        <div>Content Loaded</div>
      </QueryBoundary>,
    );

    expect(screen.getByText('Client name is required')).toBeInTheDocument();
  });

  it('renders ErrorPanel masking message for 500 error, displaying generic text and requestId', () => {
    const err = new ApiError(
      500,
      'INTERNAL_SERVER_ERROR',
      'Database connection string exposed',
      undefined,
      'req-999',
    );
    const query = {
      isLoading: false,
      isError: true,
      error: err,
      data: undefined,
      refetch: vi.fn(),
    };

    render(
      <QueryBoundary query={query}>
        <div>Content Loaded</div>
      </QueryBoundary>,
    );

    expect(screen.getByText('A server error occurred. Please try again later.')).toBeInTheDocument();
    expect(screen.queryByText('Database connection string exposed')).not.toBeInTheDocument();
    expect(screen.getByText('Request ID: req-999')).toBeInTheDocument();
  });
});
