import { useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { useDashboardSummary } from './hooks';
import { AdminDashboard } from './AdminDashboard';
import { StaffDashboard } from './StaffDashboard';

function getCurrentMonth() {
  const now = new Date(), y = now.getFullYear(), m = now.getMonth();
  const start = `${y}-${String(m + 1).padStart(2, '0')}-01`;
  const endDay = new Date(y, m + 1, 0).getDate();
  const end = `${y}-${String(m + 1).padStart(2, '0')}-${String(endDay).padStart(2, '0')}`;
  return { from: start, to: end };
}

export function DashboardPage() {
  const { user } = useAuth();
  const [dates, setDates] = useState(getCurrentMonth());
  const { data: res, isLoading, isError, error, refetch } = useDashboardSummary(dates.from, dates.to);

  const isStaff = user?.role === 'STAFF';

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {isStaff ? 'Staff Dashboard' : 'Executive Dashboard'}
          </h1>
          <p className="text-sm text-slate-500">
            {isStaff ? 'Track your active tasks, leads, and quotations.' : 'Company overview, cash collections, and financial health.'}
          </p>
        </div>

        {!isStaff && (
          <div className="flex items-center gap-2 rounded-lg border bg-white p-2 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <span className="text-xs font-medium text-slate-500">Period:</span>
            <input
              type="date"
              aria-label="Filter from date"
              value={dates.from}
              onChange={(e) => setDates((prev) => ({ ...prev, from: e.target.value }))}
              className="rounded border p-1 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            <span className="text-xs text-slate-400">to</span>
            <input
              type="date"
              aria-label="Filter to date"
              value={dates.to}
              onChange={(e) => setDates((prev) => ({ ...prev, to: e.target.value }))}
              className="rounded border p-1 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
        )}
      </div>

      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300">
          <p className="font-semibold">Failed to load dashboard data</p>
          <p className="mt-1 text-xs">{(error as any)?.message || 'An error occurred while fetching metrics.'}</p>
          <button onClick={() => refetch()} className="mt-2 text-xs font-semibold text-red-800 underline dark:text-red-200">
            Retry
          </button>
        </div>
      )}

      {isStaff ? (
        <StaffDashboard data={res?.data} isLoading={isLoading} isError={isError} />
      ) : (
        <AdminDashboard data={res?.data} isLoading={isLoading} isError={isError} />
      )}
    </div>
  );
}

export default DashboardPage;
