import type { TrajectoryMonth } from "./types";

export function RevenueChartArea({
  months,
  maxVal,
}: {
  months: TrajectoryMonth[];
  maxVal: number;
}) {
  const fmt = (v: number) =>
    v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v}`;

  return (
    <div className="relative mt-8 h-48 border-b border-slate-100 flex items-end justify-between px-4 pb-2">
      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40">
        {[1, 0.75, 0.5, 0.25].map((pct, idx) => (
          <div
            key={idx}
            className="border-b border-dashed border-slate-200 flex justify-end pr-2"
          >
            <span className="text-[9px] text-slate-400 bg-white px-1">
              {fmt(Math.round(maxVal * pct))}
            </span>
          </div>
        ))}
      </div>
      <div className="relative z-10 grid grid-cols-5 gap-4 w-full h-full items-end">
        {months.map((item) => (
          <div
            key={item.m}
            className={`relative flex flex-col items-center h-full justify-end ${
              item.isCurrent
                ? "rounded-xl border border-indigo-200 bg-indigo-50/30 p-1.5 pt-4"
                : "p-1.5"
            }`}
          >
            {item.isCurrent && (
              <span className="absolute -top-3 px-2 py-0.5 rounded-full bg-indigo-600 text-[8px] font-bold text-white shadow-xs">
                CURRENT
              </span>
            )}
            <div className="flex items-end gap-1.5 h-full w-full justify-center">
              <div
                style={{ height: `${item.invPct}%` }}
                title={`Invoiced: $${item.inv}`}
                className="w-2.5 rounded-t bg-indigo-400 transition-all hover:bg-indigo-500"
              />
              <div
                style={{ height: `${item.colPct}%` }}
                title={`Collected: $${item.col}`}
                className="w-2.5 rounded-t bg-emerald-500 transition-all hover:bg-emerald-600"
              />
              <div
                style={{ height: `${item.expPct}%` }}
                title={`Expenses: $${item.exp}`}
                className="w-2.5 rounded-t bg-amber-400 transition-all hover:bg-amber-500"
              />
            </div>
            <span
              className={`mt-2 text-[11px] font-semibold ${item.isCurrent ? "text-indigo-700 font-bold" : "text-slate-500"}`}
            >
              {item.m}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
