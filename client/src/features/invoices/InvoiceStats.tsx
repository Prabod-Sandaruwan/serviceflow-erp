import { FileText, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { useInvoiceStats } from './invoiceStatsHook';
import type { Invoice } from './types';

const fmt = (v?: number) =>
  `$${Number(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function InvoiceStats({ invoices = [] }: { invoices?: Invoice[] }) {
  const { data } = useInvoiceStats();
  const raw: any = data?.data;
  const apiStats = raw && typeof raw.totalInvoiced === 'number' ? raw : raw?.data;

  const fallback = invoices.reduce(
    (acc, inv) => {
      const tot = Number(inv.total || 0), pd = Number(inv.paid || 0), bal = Number(inv.balance || 0);
      acc.totalInvoiced += tot;
      acc.totalCollected += pd;
      if (inv.status !== 'CANCELLED' && inv.status !== 'PAID') acc.outstandingBalance += bal;
      if (inv.isOverdue && inv.status !== 'PAID' && inv.status !== 'CANCELLED') {
        acc.overdueAccounts += bal;
        acc.overdueCount += 1;
      }
      return acc;
    },
    { totalInvoiced: 0, totalCount: invoices.length, totalCollected: 0, outstandingBalance: 0, overdueAccounts: 0, overdueCount: 0 },
  );

  const stats = apiStats || fallback;
  const pct = stats.totalInvoiced > 0 ? ((stats.totalCollected / stats.totalInvoiced) * 100).toFixed(2) : '0.00';

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6" data-purpose="invoices-summary-metrics">
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">TOTAL INVOICED</p>
          <div className="text-2xl font-black text-slate-900 tracking-tight mt-1">{fmt(stats.totalInvoiced)}</div>
          <span className="text-[11px] text-slate-500 mt-1 inline-block"><strong className="text-slate-700">{stats.totalCount}</strong> Total Invoices • Gross billings to date</span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><FileText className="w-5 h-5" /></div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">TOTAL COLLECTED</p>
          <div className="text-2xl font-black text-emerald-600 tracking-tight mt-1">{fmt(stats.totalCollected)}</div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 mt-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{pct}% realized cashflow</span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0"><CheckCircle2 className="w-5 h-5" /></div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">OUTSTANDING BALANCE</p>
          <div className="text-2xl font-black text-slate-900 tracking-tight mt-1">{fmt(stats.outstandingBalance)}</div>
          <span className="text-[11px] text-slate-500 mt-1 inline-block">Pending &amp; uncollected</span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0"><Clock className="w-5 h-5" /></div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-wider text-rose-500 uppercase">OVERDUE ACCOUNTS</p>
          <div className="text-2xl font-black text-rose-600 tracking-tight mt-1">{fmt(stats.overdueAccounts)}</div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="inline-flex px-1.5 py-0.5 text-[10px] font-bold rounded bg-rose-50 text-rose-700 border border-rose-200">{stats.overdueCount} Critical Invoice{stats.overdueCount === 1 ? '' : 's'}</span>
            <span className="text-[11px] text-slate-400">Immediate Follow-up</span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0"><AlertTriangle className="w-5 h-5" /></div>
      </div>
    </section>
  );
}

export default InvoiceStats;

