export function DonutSvg({
  colLen,
  outLen,
  riskLen,
  total,
  riskPct,
}: {
  colLen: number;
  outLen: number;
  riskLen: number;
  total: number;
  riskPct: string;
}) {
  const c = 301.6;

  return (
    <div className="relative my-4 flex items-center justify-center">
      <svg className="h-40 w-40 -rotate-90 transform" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r="48"
          stroke="#f1f5f9"
          strokeWidth="12"
          fill="none"
        />
        {colLen > 0 && (
          <circle
            cx="60"
            cy="60"
            r="48"
            stroke="#10b981"
            strokeWidth="12"
            fill="none"
            strokeDasharray={`${colLen} ${c - colLen}`}
            strokeDashoffset={0}
          />
        )}
        {outLen > 0 && (
          <circle
            cx="60"
            cy="60"
            r="48"
            stroke="#6366f1"
            strokeWidth="12"
            fill="none"
            strokeDasharray={`${outLen} ${c - outLen}`}
            strokeDashoffset={-colLen}
          />
        )}
        {riskLen > 0 && (
          <circle
            cx="60"
            cy="60"
            r="48"
            stroke="#f43f5e"
            strokeWidth="12"
            fill="none"
            strokeDasharray={`${riskLen} ${c - riskLen}`}
            strokeDashoffset={-(colLen + outLen)}
          />
        )}
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
          Total Booked
        </span>
        <span className="text-lg font-black text-slate-900 tracking-tight">
          ${Math.round(total).toLocaleString()}
        </span>
        <span className="mt-0.5 rounded-full bg-rose-50 px-2 py-0.5 text-[9px] font-bold text-rose-600">
          {riskPct}% Aging Risk
        </span>
      </div>
    </div>
  );
}
