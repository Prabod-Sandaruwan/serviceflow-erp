import { FolderKanban, TrendingUp, CheckCircle2, Percent } from 'lucide-react';

const fmt = (v?: string | number) =>
  `$${Number(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function ProjectKpiCards({ list = [] }: { list?: any[] }) {
  const totals = list.reduce(
    (acc, p) => {
      acc.revenue += Number(p.revenue || 0);
      acc.billed += Number(p.billed || 0);
      acc.collected += Number(p.collected || 0);
      acc.profit += Number(p.estimatedProfitability || 0);
      return acc;
    },
    { revenue: 0, billed: 0, collected: 0, profit: 0 },
  );

  const collectedPct = totals.billed > 0 ? ((totals.collected / totals.billed) * 100).toFixed(1) : '0.0';
  const marginPct = totals.revenue > 0 ? ((totals.profit / totals.revenue) * 100).toFixed(1) : '0.0';

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">ACTIVE PROJECTS</p>
          <div className="text-2xl font-black text-slate-900 tracking-tight mt-1">{list.length}</div>
          <span className="text-[11px] text-slate-500 mt-1 inline-block">Active delivery portfolio</span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <FolderKanban className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">TOTAL BILLED</p>
          <div className="text-2xl font-black text-slate-900 tracking-tight mt-1">{fmt(totals.billed)}</div>
          <span className="text-[11px] text-slate-500 mt-1 inline-block">Milestones invoiced</span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
          <TrendingUp className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">COLLECTION RATE</p>
          <div className="text-2xl font-black text-emerald-600 tracking-tight mt-1">{collectedPct}%</div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-block">Realized client cash</span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-wider text-emerald-700 uppercase">OVERALL MARGIN</p>
          <div className="text-2xl font-black text-emerald-700 tracking-tight mt-1">{marginPct}%</div>
          <span className="text-[11px] text-slate-500 mt-1 inline-block">Net delivery margin</span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <Percent className="w-5 h-5" />
        </div>
      </div>
    </section>
  );
}

export default ProjectKpiCards;
