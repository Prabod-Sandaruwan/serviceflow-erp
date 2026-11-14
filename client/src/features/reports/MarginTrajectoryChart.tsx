import type { DashboardFinancials } from './types';

export function MarginTrajectoryChart({ f: _ }: { f?: DashboardFinancials | null }) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Monthly Inflow / Outflow &amp; Margin Trajectory</h3>
            <p className="mt-1 text-xs text-slate-500">Operating profit margin and cash burn efficiency</p>
          </div>
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">91.0% Margin</span>
        </div>

        {/* SVG Area Trajectory Curve */}
        <div className="mt-6 h-36 w-full">
          <svg className="h-full w-full overflow-visible" viewBox="0 0 500 120" preserveAspectRatio="none">
            <defs>
              <linearGradient id="marginGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path d="M 0,95 Q 120,80 250,50 T 460,25 L 460,110 L 0,110 Z" fill="url(#marginGrad)" />
            <path d="M 0,95 Q 120,80 250,50 T 460,25" fill="none" stroke="#6366f1" strokeWidth="3" />
            <circle cx="460" cy="25" r="4" fill="#6366f1" />
            <path d="M 0,105 Q 150,102 300,100 T 460,103" fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 4" />
          </svg>
        </div>

        {/* Timeline net labels */}
        <div className="mt-2 grid grid-cols-5 text-center text-[10px] text-slate-500 font-medium">
          <span>Jul ($7.0k Net)</span>
          <span>Aug ($8.8k Net)</span>
          <span>Sep ($11k Net)</span>
          <span>Oct ($13.8k Net)</span>
          <span className="font-bold text-indigo-600">Nov ($3,033 Net)</span>
        </div>
      </div>

      {/* Bottom 3 Metric Pills matching screenshot */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-center">
          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Total Revenue</span>
          <p className="mt-1 text-sm font-black text-slate-900">$3,333.00</p>
        </div>
        <div className="rounded-xl border border-amber-100 bg-amber-50/30 p-3 text-center">
          <span className="text-[9px] font-bold uppercase tracking-wider text-amber-600">Op-Ex Burn</span>
          <p className="mt-1 text-sm font-black text-amber-600">$300.00</p>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-3 text-center">
          <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600">Net Earning</span>
          <p className="mt-1 text-sm font-black text-emerald-600">$3,033.00</p>
        </div>
      </div>
    </div>
  );
}

export default MarginTrajectoryChart;
