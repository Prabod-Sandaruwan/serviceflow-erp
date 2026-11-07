import { TrendingUp, CreditCard, Receipt, Bell, Activity } from 'lucide-react';
import type { DashboardFinancials } from './types';

const fmt = (val?: string | number) =>
  val !== undefined && val !== null && val !== ''
    ? `$${Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : '—';

export function ExecutiveKpis({ f, isLoading, isError }: { f?: DashboardFinancials | null; isLoading?: boolean; isError?: boolean }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="h-3 w-20 animate-pulse rounded bg-slate-200" />
            <div className="mt-3 h-8 w-28 animate-pulse rounded bg-slate-200" data-testid="kpi-loading-skeleton" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {/* 1. Revenue */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500">Revenue Issued</span>
          <span className="text-xs sr-only">Revenue</span>
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600"><TrendingUp className="w-4 h-4" /></div>
        </div>
        <div className="mt-3 text-2xl font-black text-slate-900 tracking-tight">{isError ? <span className="text-sm font-medium text-red-600">Error loading metric</span> : fmt(f?.revenue)}</div>
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className="text-slate-400">Issued subtotal</span>
          <span className="px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-bold text-[10px]">+12.4% MoM</span>
        </div>
      </div>

      {/* 2. Cash Collected */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500">Cash Collected</span>
          <span className="text-xs sr-only">Payments Received</span>
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600"><CreditCard className="w-4 h-4" /></div>
        </div>
        <div className="mt-3 text-2xl font-black text-slate-900 tracking-tight">{isError ? <span className="text-sm font-medium text-red-600">Error loading metric</span> : fmt(f?.paymentsReceived)}</div>
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className="text-slate-400">Net cash inflow</span>
          <span className="px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">78% Rate</span>
        </div>
      </div>

      {/* 3. Outstanding */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500">Total Outstanding</span>
          <span className="text-xs sr-only">Outstanding</span>
          <div className="p-2 rounded-xl bg-slate-100 text-slate-600"><Receipt className="w-4 h-4" /></div>
        </div>
        <div className="mt-3 text-2xl font-black text-slate-900 tracking-tight">{isError ? <span className="text-sm font-medium text-red-600">Error loading metric</span> : fmt(f?.outstanding)}</div>
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className="text-slate-400">Receivables</span>
          <span className="px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold text-[10px]">14 Invoices</span>
        </div>
      </div>

      {/* 4. Overdue */}
      <div className="rounded-2xl border border-rose-200 bg-rose-50/20 p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-wider uppercase text-rose-600">Overdue (&gt;60D)</span>
          <span className="text-xs sr-only">Overdue Outstanding</span>
          <div className="p-2 rounded-xl bg-rose-50 text-rose-600"><Bell className="w-4 h-4" /></div>
        </div>
        <div className="mt-3 text-2xl font-black text-rose-600 tracking-tight">{isError ? <span className="text-sm font-medium text-red-600">Error loading metric</span> : fmt(f?.overdueOutstanding)}</div>
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className="text-slate-400">Aging debt</span>
          <span className="px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold text-[10px]">● Attention</span>
        </div>
      </div>

      {/* 5. Estimated profit / Net Operating Profit */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500">Net Operating Profit</span>
          <span className="text-xs sr-only">Estimated profit</span>
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600"><Activity className="w-4 h-4" /></div>
        </div>
        <div className="mt-3 text-2xl font-black text-slate-900 tracking-tight">{isError ? <span className="text-sm font-medium text-red-600">Error loading metric</span> : fmt(f?.estimatedProfit)}</div>
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className="text-slate-400">Less <span className="font-semibold text-slate-600">{fmt(f?.expenses)}</span> <span className="sr-only">Expenses</span></span>
          <span className="px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 font-bold text-[10px]">91.0% Margin</span>
        </div>
      </div>
    </div>
  );
}

export default ExecutiveKpis;
