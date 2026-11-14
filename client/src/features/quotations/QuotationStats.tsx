import { FileText, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import type { Quotation } from './types';

const fmt = (v?: number) =>
  `$${Number(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function QuotationStats({ quotations = [] }: { quotations?: Quotation[] }) {
  const totalPipeline = quotations.reduce((acc, q) => acc + Number(q.total || 0), 0);
  const acceptedList = quotations.filter((q) => q.status === 'ACCEPTED');
  const acceptedTotal = acceptedList.reduce((acc, q) => acc + Number(q.total || 0), 0);
  const pendingCount = quotations.filter((q) => q.status === 'PENDING_APPROVAL').length;
  const expiredCount = quotations.filter((q) => q.isExpired).length;

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">PIPELINE VALUE</p>
          <div className="text-2xl font-black text-slate-900 tracking-tight mt-1">{fmt(totalPipeline)}</div>
          <span className="text-[11px] text-slate-500 mt-1 inline-block"><strong className="text-slate-700">{quotations.length}</strong> Total Proposals</span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <FileText className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">ACCEPTED CONTRACTS</p>
          <div className="text-2xl font-black text-emerald-600 tracking-tight mt-1">{fmt(acceptedTotal)}</div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{acceptedList.length} Approved &amp; signed
          </span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">PENDING APPROVAL</p>
          <div className="text-2xl font-black text-amber-600 tracking-tight mt-1">{pendingCount}</div>
          <span className="text-[11px] text-slate-500 mt-1 inline-block">Awaiting manager review</span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
          <Clock className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-wider text-rose-500 uppercase">EXPIRED PROPOSALS</p>
          <div className="text-2xl font-black text-rose-600 tracking-tight mt-1">{expiredCount}</div>
          <span className="text-[11px] text-slate-400 mt-1 inline-block">Need revision or follow-up</span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
          <AlertCircle className="w-5 h-5" />
        </div>
      </div>
    </section>
  );
}

export default QuotationStats;
