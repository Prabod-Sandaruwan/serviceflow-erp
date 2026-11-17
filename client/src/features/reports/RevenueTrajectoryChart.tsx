import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import type { DashboardFinancials, TrajectoryMonth } from "./types";
import { RevenueChartArea } from "./RevenueChartArea";
import { getFallbackMonths, computeVelocity } from "./trajectoryUtils";

export function RevenueTrajectoryChart({
  trajectories,
}: {
  f?: DashboardFinancials | null;
  trajectories?: TrajectoryMonth[];
}) {
  const months =
    trajectories && trajectories.length > 0
      ? trajectories
      : getFallbackMonths();
  const { text: velocityText, isPositive, curr } = computeVelocity(months);
  const maxVal = Math.max(1, ...months.flatMap((m) => [m.inv, m.col, m.exp]));

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">
              Revenue vs. Cashflow &amp; Billing Trajectory
            </h3>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${isPositive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}
            >
              {velocityText}
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-indigo-500" />
              Invoiced
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
              Collected Cash
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-amber-400" />
              Op-Expenses
            </span>
          </div>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Consolidated monthly invoiced billing against liquid cash collection
          and burn rate
        </p>
        <RevenueChartArea months={months} maxVal={maxVal} />
      </div>
      <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>
            Active trajectory: {curr?.m} collections pacing healthy turnover.
          </span>
        </div>
        <Link
          to="/reports/finance"
          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors shrink-0"
        >
          View Full Financial Ledger &rarr;
        </Link>
      </div>
    </div>
  );
}

export default RevenueTrajectoryChart;
