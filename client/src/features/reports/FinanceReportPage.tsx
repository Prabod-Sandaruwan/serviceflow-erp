import { useState } from 'react';
import { useFinanceReport, useDownloadCsv } from './hooks';
import { ReportDateFilter } from './ReportDateFilter';
import { FinanceKpiCards } from './FinanceKpiCards';
import { FinanceReportTable } from './FinanceReportTable';

function getCurrentMonth() {
  const now = new Date(), y = now.getFullYear(), m = now.getMonth();
  const start = `${y}-${String(m + 1).padStart(2, '0')}-01`;
  const end = `${y}-${String(m + 1).padStart(2, '0')}-${String(new Date(y, m + 1, 0).getDate()).padStart(2, '0')}`;
  return { from: start, to: end };
}

export function FinanceReportPage() {
  const [dates, setDates] = useState(getCurrentMonth());
  const { data: res, isLoading, isError } = useFinanceReport(dates.from, dates.to);
  const downloadMut = useDownloadCsv('finance');
  const d = res?.data;

  return (
    <div className="space-y-6 p-6">
      <div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
          <span>Finance &amp; Billing</span>
          <span>&rsaquo;</span>
          <span className="text-slate-600 font-medium">Finance Report</span>
        </div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900">Finance Report</h1>
        <p className="mt-0.5 text-xs text-slate-500">Company-wide financial performance, collections, liabilities, and estimated margins</p>
      </div>

      <ReportDateFilter
        from={dates.from}
        to={dates.to}
        onApply={setDates}
        onDownloadCsv={() => downloadMut.mutate({ from: dates.from, to: dates.to })}
        isDownloading={downloadMut.isPending}
      />

      {isLoading ? (
        <div className="p-8 text-center text-sm text-slate-500 bg-white rounded-xl border border-slate-200">Loading finance report...</div>
      ) : isError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700">Failed to load finance report.</div>
      ) : (
        <>
          <FinanceKpiCards data={d} />
          <FinanceReportTable data={d} />
        </>
      )}
    </div>
  );
}

export default FinanceReportPage;
