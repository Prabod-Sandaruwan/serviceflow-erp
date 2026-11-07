import React from 'react';

export interface KpiCardProps {
  title: string;
  value?: React.ReactNode;
  subtitle?: string;
  isLoading?: boolean;
  isError?: boolean;
  testId?: string;
}

export function KpiCard({
  title,
  value,
  subtitle,
  isLoading = false,
  isError = false,
  testId,
}: KpiCardProps) {
  return (
    <div
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      data-testid={testId || `kpi-card-${title.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {title}
      </p>

      <div className="mt-2">
        {isLoading ? (
          <div className="h-8 w-28 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        ) : isError ? (
          <span className="text-sm font-medium text-red-500">Error loading metric</span>
        ) : (
          <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {value !== undefined && value !== null && value !== '' ? value : '—'}
          </p>
        )}
      </div>

      {subtitle && !isLoading && !isError && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
      )}
    </div>
  );
}

export default KpiCard;
