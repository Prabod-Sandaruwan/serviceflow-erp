import type { TrajectoryMonth } from "./types";

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function getFallbackMonths(): TrajectoryMonth[] {
  const now = new Date();
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (4 - i), 1),
    );
    return {
      m: MONTH_NAMES[d.getUTCMonth()],
      inv: 0,
      col: 0,
      exp: 0,
      invPct: 0,
      colPct: 0,
      expPct: 0,
      isCurrent: i === 4,
    };
  });
}

export function computeVelocity(months: TrajectoryMonth[]) {
  const activeIdx = Math.max(
    0,
    months.findIndex((m) => m.isCurrent),
  );
  const curr = months[activeIdx] || months[months.length - 1];
  const prev = activeIdx > 0 ? months[activeIdx - 1] : null;

  if (prev && prev.col > 0) {
    const diff = (((curr.col - prev.col) / prev.col) * 100).toFixed(1);
    const isPositive = Number(diff) >= 0;
    return {
      text: `${isPositive ? "+" : ""}${diff}% Velocity`,
      isPositive,
      curr,
    };
  }
  if (curr && curr.col > 0) {
    return { text: "+100% Velocity", isPositive: true, curr };
  }
  return { text: "0.0% Velocity", isPositive: true, curr };
}
