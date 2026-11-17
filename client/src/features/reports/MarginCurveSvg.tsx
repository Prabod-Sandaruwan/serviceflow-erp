interface MonthData {
  inv?: number;
  exp?: number;
  isCurrent?: boolean;
}

function buildSmoothPath(pts: Array<{ x: number; y: number }>) {
  if (pts.length === 0) return "";
  let d = `M ${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const c = pts[i];
    const n = pts[i + 1];
    const mx = c.x + (n.x - c.x) / 2;
    d += ` C ${mx},${c.y} ${mx},${n.y} ${n.x},${n.y}`;
  }
  return d;
}

export function MarginCurveSvg({
  months,
  fallbackNet = 0,
}: {
  months: MonthData[];
  fallbackNet?: number;
}) {
  const nets = months.map((m) =>
    m.inv !== undefined && m.exp !== undefined
      ? m.inv - m.exp
      : m.isCurrent
        ? fallbackNet
        : 0,
  );
  const exps = months.map((m) => m.exp ?? 0);

  const maxVal = Math.max(1, ...nets, ...exps);
  const minVal = Math.min(0, ...nets);
  const range = maxVal - minVal || 1;

  const toY = (v: number) => Math.round(105 - ((v - minVal) / range) * 85);

  const netPts = nets.map((v, i) => ({ x: 30 + i * 105, y: toY(v) }));
  const expPts = exps.map((v, i) => ({ x: 30 + i * 105, y: toY(v) }));

  const netPath = buildSmoothPath(netPts);
  const expPath = buildSmoothPath(expPts);
  const areaPath =
    netPts.length > 0
      ? `${netPath} L ${netPts[netPts.length - 1].x},115 L ${netPts[0].x},115 Z`
      : "";
  const lastPt = netPts[netPts.length - 1] || { x: 450, y: 50 };

  return (
    <div className="mt-6 h-36 w-full">
      <svg
        className="h-full w-full overflow-visible"
        viewBox="0 0 500 120"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="marginGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        {areaPath && <path d={areaPath} fill="url(#marginGrad)" />}
        {netPath && (
          <path d={netPath} fill="none" stroke="#6366f1" strokeWidth="3" />
        )}
        <circle cx={lastPt.x} cy={lastPt.y} r="4" fill="#6366f1" />
        {expPath && (
          <path
            d={expPath}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2"
            strokeDasharray="4 4"
          />
        )}
      </svg>
    </div>
  );
}
