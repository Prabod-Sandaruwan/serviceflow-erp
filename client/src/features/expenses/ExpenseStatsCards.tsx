import { Receipt, CheckCircle2, Ban, Tag } from 'lucide-react';
import type { Expense } from './types';

const fmt = (v?: number) =>
  `$${Number(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function ExpenseStatsCards({ expenses = [] }: { expenses?: Expense[] }) {
  const active = expenses.filter((e) => e.status !== 'VOIDED');
  const voided = expenses.filter((e) => e.status === 'VOIDED');

  const activeTotal = active.reduce((acc, e) => acc + Number(e.amount || 0), 0);
  const voidedTotal = voided.reduce((acc, e) => acc + Number(e.amount || 0), 0);
  const grossTotal = activeTotal + voidedTotal;

  const catMap = active.reduce((acc: Record<string, number>, e) => {
    acc[e.category] = (acc[e.category] || 0) + Number(e.amount || 0);
    return acc;
  }, {});

  const topEntry = Object.entries(catMap).sort((a, b) => b[1] - a[1])[0];
  const topCategory = topEntry ? topEntry[0].replace(/_/g, ' ') : 'None';
  const avgActive = active.length > 0 ? activeTotal / active.length : 0;

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6" data-purpose="expenses-summary-metrics">
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">TOTAL RECORDED</p>
          <div className="text-2xl font-black text-slate-900 tracking-tight mt-1">{fmt(grossTotal)}</div>
          <span className="text-[11px] text-slate-500 mt-1 inline-block"><strong className="text-slate-700">{expenses.length}</strong> Total Entries • Cumulative spend</span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><Receipt className="w-5 h-5" /></div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">ACTIVE &amp; BILLABLE</p>
          <div className="text-2xl font-black text-emerald-600 tracking-tight mt-1">{fmt(activeTotal)}</div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 mt-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{active.length} Active • Operational costs</span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0"><CheckCircle2 className="w-5 h-5" /></div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-wider text-rose-500 uppercase">VOIDED COSTS</p>
          <div className="text-2xl font-black text-rose-600 tracking-tight mt-1">{fmt(voidedTotal)}</div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="inline-flex px-1.5 py-0.5 text-[10px] font-bold rounded bg-rose-50 text-rose-700 border border-rose-200">{voided.length} Voided</span>
            <span className="text-[11px] text-slate-400">Reversed transactions</span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0"><Ban className="w-5 h-5" /></div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-wider text-purple-600 uppercase">TOP CATEGORY</p>
          <div className="text-xl font-black text-purple-700 tracking-tight mt-1 truncate max-w-[170px]" title={topCategory}>{topCategory}</div>
          <span className="text-[11px] text-slate-500 mt-1 inline-block">Avg: <strong className="text-slate-700">{fmt(avgActive)}</strong> per entry</span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0"><Tag className="w-5 h-5" /></div>
      </div>
    </section>
  );
}

export default ExpenseStatsCards;

