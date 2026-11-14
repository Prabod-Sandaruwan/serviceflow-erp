import { CheckCircle2 } from 'lucide-react';
import type { DashboardFinancials } from './types';

const MONTHS = [
  { m: 'Jul', inv: 45, col: 55, exp: 20 },
  { m: 'Aug', inv: 65, col: 60, exp: 25 },
  { m: 'Sep', inv: 75, col: 70, exp: 25 },
  { m: 'Oct', inv: 80, col: 85, exp: 28 },
  { m: 'Nov', inv: 40, col: 95, exp: 20, isCurrent: true },
];

export function RevenueTrajectoryChart({ f: _ }: { f?: DashboardFinancials | null }) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">Revenue vs. Cashflow &amp; Billing Trajectory</h3>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">+18.2% Velocity</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-indigo-500" />Invoiced</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />Collected Cash</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-amber-400" />Op-Expenses</span>
            <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 border-t border-dashed border-slate-400" />Run-Rate</span>
          </div>
        </div>
        <p className="mt-1 text-xs text-slate-500">Consolidated monthly invoiced billing against liquid cash collection and burn rate</p>

        {/* Chart Area */}
        <div className="relative mt-8 h-48 border-b border-slate-100 flex items-end justify-between px-4 pb-2">
          {/* Subtle guide lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40">
            {['Peak Target', 'Growth Benchmark', 'Break-even', 'Operations'].map((label, idx) => (
              <div key={idx} className="border-b border-dashed border-slate-200 flex justify-end pr-2">
                <span className="text-[9px] text-slate-400 bg-white px-1">{label}</span>
              </div>
            ))}
          </div>

          {/* Bar Groups */}
          <div className="relative z-10 grid grid-cols-5 gap-4 w-full h-full items-end">
            {MONTHS.map((item) => (
              <div key={item.m} className={`relative flex flex-col items-center h-full justify-end ${item.isCurrent ? 'rounded-xl border border-indigo-200 bg-indigo-50/30 p-1.5 pt-4' : 'p-1.5'}`}>
                {item.isCurrent && (
                  <span className="absolute -top-3 px-2 py-0.5 rounded-full bg-indigo-600 text-[8px] font-bold text-white shadow-xs">
                    CURRENT
                  </span>
                )}
                <div className="flex items-end gap-1.5 h-full w-full justify-center">
                  <div style={{ height: `${item.inv}%` }} className="w-2.5 rounded-t bg-indigo-400 transition-all hover:bg-indigo-500" />
                  <div style={{ height: `${item.col}%` }} className="w-2.5 rounded-t bg-emerald-500 transition-all hover:bg-emerald-600" />
                  <div style={{ height: `${item.exp}%` }} className="w-2.5 rounded-t bg-amber-400 transition-all hover:bg-amber-500" />
                </div>
                <span className={`mt-2 text-[11px] font-semibold ${item.isCurrent ? 'text-indigo-700 font-bold' : 'text-slate-500'}`}>
                  {item.m}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>High collection turnaround in November: prior milestone billings converted to liquid cash.</span>
        </div>
        <a href="/reports/finance" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors shrink-0">
          View Full Financial Ledger &rarr;
        </a>
      </div>
    </div>
  );
}

export default RevenueTrajectoryChart;
