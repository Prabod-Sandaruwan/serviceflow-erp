const fmt = (v?: string | number) =>
  v !== undefined && v !== null && v !== ''
    ? `$${Number(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : '—';

export function FinanceReportTable({ data: d }: { data?: any }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200/80 bg-white shadow-2xs">
      <table className="min-w-full divide-y divide-slate-200/80 text-left text-xs" data-testid="finance-report-table">
        <thead className="bg-slate-50/75 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          <tr>
            <th className="px-5 py-3.5">Financial Metric</th>
            <th className="px-5 py-3.5 text-right">Amount</th>
            <th className="px-5 py-3.5">Basis &amp; Calculation Criteria</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200/70 text-slate-800">
          <tr className="hover:bg-slate-50/50 transition">
            <td className="px-5 py-3.5 font-bold text-slate-900">Revenue</td>
            <td className="px-5 py-3.5 text-right font-mono font-bold text-slate-900 text-sm" data-testid="metric-revenue">{fmt(d?.revenue)}</td>
            <td className="px-5 py-3.5 text-xs text-slate-500">Invoice subtotals (ISSUED, PARTIALLY_PAID, PAID)</td>
          </tr>
          <tr className="hover:bg-slate-50/50 transition">
            <td className="px-5 py-3.5 font-bold text-slate-900">Payments Received</td>
            <td className="px-5 py-3.5 text-right font-mono font-bold text-emerald-600 text-sm" data-testid="metric-payments">{fmt(d?.paymentsReceived)}</td>
            <td className="px-5 py-3.5 text-xs text-slate-500">Active payment receipts recorded into accounts</td>
          </tr>
          <tr className="hover:bg-slate-50/50 transition">
            <td className="px-5 py-3.5 font-bold text-slate-900">Outstanding</td>
            <td className="px-5 py-3.5 text-right font-mono font-bold text-amber-600 text-sm" data-testid="metric-outstanding">{fmt(d?.outstanding)}</td>
            <td className="px-5 py-3.5 text-xs text-slate-500">Pending receivables on issued invoices awaiting payment</td>
          </tr>
          <tr className="hover:bg-slate-50/50 transition">
            <td className="px-5 py-3.5 font-bold text-slate-900">Expenses</td>
            <td className="px-5 py-3.5 text-right font-mono font-bold text-rose-600 text-sm" data-testid="metric-expenses">{fmt(d?.expenses)}</td>
            <td className="px-5 py-3.5 text-xs text-slate-500">Active recorded operational and project costs</td>
          </tr>
          <tr className="bg-emerald-50/40 hover:bg-emerald-50/70 transition font-bold border-t border-emerald-100">
            <td className="px-5 py-3.5 text-emerald-900 font-extrabold text-sm">Estimated Profit</td>
            <td className="px-5 py-3.5 text-right font-mono font-extrabold text-emerald-700 text-base" data-testid="metric-profit">{fmt(d?.estimatedProfitability)}</td>
            <td className="px-5 py-3.5 text-xs text-emerald-800">Revenue minus Expenses (Realized Margin: {d?.margin || '—'})</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default FinanceReportTable;

