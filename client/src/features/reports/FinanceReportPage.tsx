import { useState } from 'react';
import { useFinanceReport, useDownloadCsv } from './hooks';
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

export function FinanceReportPage() {
  const [dates, setDates] = useState(getCurrentMonth());
  const { data: res, isLoading, isError } = useFinanceReport(dates.from, dates.to);
  const downloadMut = useDownloadCsv('finance');
  const d = res?.data;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Finance Report</h1>
        <p className="mt-1 text-sm text-slate-600">Company-wide financial performance, collections, and liabilities.</p>
      </div>

      <ReportDateFilter
        from={dates.from}
        to={dates.to}
        onApply={setDates}
        onDownloadCsv={() => downloadMut.mutate({ from: dates.from, to: dates.to })}
        isDownloading={downloadMut.isPending}
      />

      {isLoading ? (
        <div className="p-4 text-sm text-slate-500">Loading finance report...</div>
      ) : isError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">Failed to load finance report.</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm" data-testid="finance-report-table">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-700">
              <tr>
                <th className="px-4 py-3">Metric</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3">Basis / Criteria</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-900">
              <tr>
                <td className="px-4 py-3 font-medium">Revenue</td>
                <td className="px-4 py-3 text-right font-mono font-bold" data-testid="metric-revenue">{fmt(d?.revenue)}</td>
                <td className="px-4 py-3 text-xs text-slate-500">Invoice subtotals (ISSUED, PARTIALLY_PAID, PAID)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium">Payments Received</td>
                <td className="px-4 py-3 text-right font-mono font-bold" data-testid="metric-payments">{fmt(d?.paymentsReceived)}</td>
                <td className="px-4 py-3 text-xs text-slate-500">Active payment receipts recorded</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium">Outstanding</td>
                <td className="px-4 py-3 text-right font-mono font-bold" data-testid="metric-outstanding">{fmt(d?.outstanding)}</td>
                <td className="px-4 py-3 text-xs text-slate-500">Pending receivables on issued invoices</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium">Expenses</td>
                <td className="px-4 py-3 text-right font-mono font-bold" data-testid="metric-expenses">{fmt(d?.expenses)}</td>
                <td className="px-4 py-3 text-xs text-slate-500">Active recorded operational expenses</td>
              </tr>
              <tr className="bg-slate-50 font-semibold">
                <td className="px-4 py-3">Estimated Profit</td>
                <td className="px-4 py-3 text-right font-mono font-bold text-emerald-700" data-testid="metric-profit">{fmt(d?.estimatedProfitability)}</td>
                <td className="px-4 py-3 text-xs text-slate-500">Revenue minus Expenses (Margin: {d?.margin || '—'})</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default FinanceReportPage;
