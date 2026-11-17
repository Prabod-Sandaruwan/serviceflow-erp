export function InvoiceRiskBreakdown({
  col,
  colPct,
  out,
  risk,
}: {
  col: number;
  colPct: string;
  out: number;
  risk: number;
}) {
  const fmt = (v: number) =>
    v.toLocaleString(undefined, { minimumFractionDigits: 2 });

  return (
    <div className="space-y-2 text-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-slate-600 font-medium">Collected Cash</span>
        </div>
        <div className="text-right">
          <span className="font-bold text-slate-800">${fmt(col)}</span>
          <span className="ml-1 text-[10px] text-slate-400">{colPct}%</span>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-indigo-500" />
          <span className="text-slate-600 font-medium">
            Current Outstanding
          </span>
        </div>
        <div className="text-right font-bold text-slate-800">${fmt(out)}</div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-rose-500" />
          <span className="text-rose-600 font-medium">Overdue Backlog</span>
        </div>
        <div className="text-right font-bold text-rose-600">${fmt(risk)}</div>
      </div>
    </div>
  );
}
