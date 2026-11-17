import type { DashboardFinancials, TrajectoryMonth } from "./types";
import { MarginCurveSvg } from "./MarginCurveSvg";
import { MarginMetricCards } from "./MarginMetricCards";
import { getFallbackMonths } from "./trajectoryUtils";

interface Props {
  f?: DashboardFinancials | null;
  trajectories?: TrajectoryMonth[];
}

export function MarginTrajectoryChart({ f, trajectories }: Props) {
  const rev = parseFloat(f?.revenue ?? "0") || 0;
  const exp = parseFloat(f?.expenses ?? "0") || 0;
  const net = parseFloat(f?.estimatedProfit ?? "0") || rev - exp;
  const marginPct = rev > 0 ? ((net / rev) * 100).toFixed(1) : "0.0";
  const displayMonths =
    trajectories && trajectories.length === 5
      ? trajectories
      : getFallbackMonths();

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Monthly Inflow / Outflow &amp; Margin Trajectory
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Operating profit margin and cash burn efficiency
            </p>
          </div>
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
            {marginPct}% Margin
          </span>
        </div>

        <MarginCurveSvg months={displayMonths} fallbackNet={net} />

        <div className="mt-2 grid grid-cols-5 text-center text-[10px] text-slate-500 font-medium">
          {displayMonths.map((t: any) => {
            const netVal =
              t.inv !== undefined && t.exp !== undefined
                ? t.inv - t.exp
                : t.isCurrent
                  ? net
                  : 0;
            return (
              <span
                key={t.m}
                className={t.isCurrent ? "font-bold text-indigo-600" : ""}
              >
                {t.m} (${Math.round(netVal).toLocaleString()} Net)
              </span>
            );
          })}
        </div>
      </div>

      <MarginMetricCards rev={rev} exp={exp} net={net} />
    </div>
  );
}

export default MarginTrajectoryChart;
