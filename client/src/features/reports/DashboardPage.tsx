import { useState } from 'react';
import { Calendar, Download } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { useDashboardSummary, useDownloadCsv } from './hooks';
import { AdminDashboard } from './AdminDashboard';
import { StaffDashboard } from './StaffDashboard';

function getRange(p: 'month' | 'qtr' | 'ytd') {
  const now = new Date(), y = now.getFullYear(), m = now.getMonth();
  const pad = (n: number) => String(n).padStart(2, '0');
  if (p === 'ytd') return { from: `${y}-01-01`, to: `${y}-${pad(m + 1)}-${pad(now.getDate())}` };
  if (p === 'qtr') return { from: `${y}-${pad(Math.max(1, m - 2))}-01`, to: `${y}-${pad(m + 1)}-${new Date(y, m + 1, 0).getDate()}` };
  return { from: `${y}-${pad(m + 1)}-01`, to: `${y}-${pad(m + 1)}-${new Date(y, m + 1, 0).getDate()}` };
}

export function DashboardPage() {
  const { user } = useAuth();
  const [activePreset, setActivePreset] = useState<'month' | 'qtr' | 'ytd'>('month');
  const [dates, setDates] = useState(getRange('month'));
  const { data: res, isLoading, isError, error, refetch } = useDashboardSummary(dates.from, dates.to);
  const { mutate: download } = useDownloadCsv('finance');

  const isStaff = user?.role === 'STAFF';
  const hasData = isStaff
    ? Boolean(res?.data && (res.data.tasks || res.data.leadsCount !== undefined))
    : Boolean(res?.data && (res.data.financials || res.data.counts));
  const isEmpty = !isLoading && !isError && !hasData;

  const setPreset = (p: 'month' | 'qtr' | 'ytd') => {
    setActivePreset(p);
    setDates(getRange(p));
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black tracking-tight text-slate-900">{isStaff ? 'Staff Dashboard' : 'Executive Dashboard'}</h1>
            {!isStaff && <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700">Q4 Financials</span>}
          </div>
          <p className="mt-1 text-xs text-slate-500">{isStaff ? 'Track your active tasks, leads, and quotations.' : 'Consolidated company cash collection, burn rate, and financial health.'}</p>
        </div>

        {!isStaff && (
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
              {(['month', 'qtr', 'ytd'] as const).map((p) => (
                <button key={p} onClick={() => setPreset(p)} className={`rounded-lg px-3 py-1.5 transition ${activePreset === p ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}>
                  {p === 'month' ? 'This Month' : p === 'qtr' ? 'Last Qtr' : 'YTD'}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-xs">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <input type="date" aria-label="Filter from date" value={dates.from} onChange={(e) => setDates((prev) => ({ ...prev, from: e.target.value }))} className="bg-transparent text-slate-800 focus:outline-hidden" />
              <span className="text-slate-400">—</span>
              <input type="date" aria-label="Filter to date" value={dates.to} onChange={(e) => setDates((prev) => ({ ...prev, to: e.target.value }))} className="bg-transparent text-slate-800 focus:outline-hidden" />
            </div>
            <button onClick={() => download({ from: dates.from, to: dates.to })} className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs shadow-indigo-200 transition hover:bg-indigo-700">
              <Download className="h-3.5 w-3.5" />
              Export Report
            </button>
          </div>
        )}
      </div>

      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-semibold">Failed to load dashboard data</p>
          <p className="mt-1 text-xs">{(error as any)?.message || 'An error occurred while fetching metrics.'}</p>
          <button onClick={() => refetch()} className="mt-2 text-xs font-semibold text-red-800 underline">Retry</button>
        </div>
      )}

      {isEmpty ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">
          <p className="text-sm font-medium">No data available</p>
        </div>
      ) : isStaff ? (
        <StaffDashboard data={res?.data} isLoading={isLoading} isError={isError} />
      ) : (
        <AdminDashboard data={res?.data} isLoading={isLoading} isError={isError} />
      )}
    </div>
  );
}

export default DashboardPage;
