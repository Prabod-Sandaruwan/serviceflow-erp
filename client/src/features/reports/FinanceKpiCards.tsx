import { TrendingUp, CheckCircle2, Clock, DollarSign } from 'lucide-react';

const fmt = (v?: string | number) =>
  v !== undefined && v !== null && v !== ''
    ? `$${Number(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : '$0.00';

export function FinanceKpiCards({ data: d }: { data?: any }) {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">TOTAL REVENUE</p>
          <div className="text-2xl font-black text-slate-900 tracking-tight mt-1">{fmt(d?.revenue)}</div>
          <span className="text-[11px] text-slate-500 mt-1 inline-block">Gross invoiced billings</span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <TrendingUp className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">COLLECTED CASH</p>
          <div className="text-2xl font-black text-emerald-600 tracking-tight mt-1">{fmt(d?.paymentsReceived)}</div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-block">Realized cash receipts</span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">OUTSTANDING</p>
          <div className="text-2xl font-black text-amber-600 tracking-tight mt-1">{fmt(d?.outstanding)}</div>
          <span className="text-[11px] text-slate-500 mt-1 inline-block">Pending receivables</span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
          <Clock className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-wider text-emerald-700 uppercase">ESTIMATED PROFIT</p>
          <div className="text-2xl font-black text-emerald-700 tracking-tight mt-1">{fmt(d?.estimatedProfitability)}</div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 mt-1">
            Margin: <strong className="text-emerald-700">{d?.margin || '—'}</strong>
          </span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <DollarSign className="w-5 h-5" />
        </div>
      </div>
    </section>
  );
}

export default FinanceKpiCards;
