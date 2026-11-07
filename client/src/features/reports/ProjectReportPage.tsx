import { useState } from 'react';
import { useProjectReport, useDownloadCsv } from './hooks';
import { ReportDateFilter } from './ReportDateFilter';

function getCurrentMonth() {
  const now = new Date(), y = now.getFullYear(), m = now.getMonth();
  const start = `${y}-${String(m + 1).padStart(2, '0')}-01`;
  const end = `${y}-${String(m + 1).padStart(2, '0')}-${String(new Date(y, m + 1, 0).getDate()).padStart(2, '0')}`;
  return { from: start, to: end };
}

const fmt = (v?: string | number) =>
  v !== undefined && v !== null && v !== ''
    ? `$${Number(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : '—';

export function ProjectReportPage() {
  const [dates, setDates] = useState(getCurrentMonth());
  const { data: res, isLoading, isError } = useProjectReport(dates.from, dates.to);
  const downloadMut = useDownloadCsv('projects');
  const list = res?.data || [];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Project Reports</h1>
        <p className="mt-1 text-sm text-slate-600">Profitability, billing, and margin breakdowns by project.</p>
      </div>

      <ReportDateFilter
        from={dates.from}
        to={dates.to}
        onApply={setDates}
        onDownloadCsv={() => downloadMut.mutate({ from: dates.from, to: dates.to })}
        isDownloading={downloadMut.isPending}
      />

      {isLoading ? (
        <div className="p-4 text-sm text-slate-500">Loading project report...</div>
      ) : isError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">Failed to load project report.</div>
      ) : list.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">No projects found.</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs" data-testid="project-report-table">
            <thead className="bg-slate-50 font-semibold text-slate-700">
              <tr>
                <th className="px-3 py-2.5">Project Name/ID</th>
                <th className="px-3 py-2.5 text-right">Revenue</th>
                <th className="px-3 py-2.5 text-right">Billed</th>
                <th className="px-3 py-2.5 text-right">Collected</th>
                <th className="px-3 py-2.5 text-right">Expenses</th>
                <th className="px-3 py-2.5 text-right font-bold text-slate-900">Estimated project profitability</th>
                <th className="px-3 py-2.5 text-right">Margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white text-slate-900">
              {list.map((p) => (
                <tr key={p.projectId} data-testid={`project-row-${p.projectId}`}>
                  <td className="whitespace-nowrap px-3 py-2.5 font-medium">{p.name || p.projectCode || p.projectId}</td>
                  <td className="px-3 py-2.5 text-right font-mono">{fmt(p.revenue)}</td>
                  <td className="px-3 py-2.5 text-right font-mono text-slate-600">{fmt(p.billed)}</td>
                  <td className="px-3 py-2.5 text-right font-mono text-slate-600">{fmt(p.collected)}</td>
                  <td className="px-3 py-2.5 text-right font-mono text-slate-600">{fmt(p.expenses)}</td>
                  <td className="px-3 py-2.5 text-right font-mono font-bold text-emerald-700">{fmt(p.estimatedProfitability)}</td>
                  <td className="px-3 py-2.5 text-right font-mono text-slate-500">{p.margin || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ProjectReportPage;
