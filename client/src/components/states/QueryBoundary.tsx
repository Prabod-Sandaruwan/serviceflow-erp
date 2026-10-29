import type { ReactNode } from 'react';
import { Skeleton } from './Skeleton';
import { EmptyState } from './EmptyState';
import { ErrorPanel } from './ErrorPanel';

export interface QueryState<T> {
  isLoading: boolean;
  isError: boolean;
  error?: unknown;
  data?: T;
  refetch?: () => void;
}

export interface QueryBoundaryProps<T> {
  query: QueryState<T>;
  isEmpty?: (data?: T) => boolean;
  emptyMessage?: string;
  children: ReactNode;
}

export function QueryBoundary<T>({
  query,
  isEmpty,
  emptyMessage,
  children,
}: QueryBoundaryProps<T>) {
  if (query.isLoading) {
    return <Skeleton />;
  }

  if (query.isError) {
    return <ErrorPanel error={query.error} onRetry={query.refetch} />;
  }

  const noData = isEmpty
    ? isEmpty(query.data)
    : Array.isArray(query.data)
      ? query.data.length === 0
      : !query.data;

  if (noData) {
    return <EmptyState message={emptyMessage} />;
  }

  return <>{children}</>;
}

export default QueryBoundary;
