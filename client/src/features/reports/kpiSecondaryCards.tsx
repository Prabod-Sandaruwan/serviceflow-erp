import { Bell, Activity } from "lucide-react";
import type { DashboardFinancials } from "./types";
import type { KpiCardProps } from "./KpiCard";

const fmt = (v?: string | number) =>
  v !== undefined && v !== null && v !== ""
    ? `$${Number(v).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : "—";

export function getSecondaryKpis(
  f?: DashboardFinancials | null,
  isError?: boolean,
): KpiCardProps[] {
  const err = (
    <span className="text-sm font-medium text-red-600">
      Error loading metric
    </span>
  );
  const rev = Number(f?.revenue || 0);
  const isOverdue = Number(f?.overdueOutstanding || 0) > 0;
  const margin =
    rev > 0
      ? ((Number(f?.estimatedProfit || 0) / rev) * 100).toFixed(1)
      : "0.0";

  return [
    {
      title: "Overdue (>60D)",
      srTitle: "Overdue Outstanding",
      icon: <Bell className="w-4 h-4" />,
      iconBg: "bg-rose-50",
      iconColor: "text-rose-600",
      value: isError ? err : fmt(f?.overdueOutstanding),
      subtitle: "Aging debt",
      cardClass: "border-rose-200 bg-rose-50/20",
      valueClass: "text-rose-600",
      badge: (
        <span
          className={`px-1.5 py-0.5 rounded-full font-bold text-[10px] ${isOverdue ? "bg-rose-100 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}
        >
          {isOverdue ? "● Attention" : "● Clear"}
        </span>
      ),
    },
    {
      title: "Net Operating Profit",
      srTitle: "Estimated profit",
      icon: <Activity className="w-4 h-4" />,
      iconBg: "bg-indigo-50",
      iconColor: "text-indigo-600",
      value: isError ? err : fmt(f?.estimatedProfit),
      subtitle: (
        <>
          Less{" "}
          <span className="font-semibold text-slate-600">
            {fmt(f?.expenses)}
          </span>{" "}
          <span className="sr-only">Expenses</span>
        </>
      ),
      badge: (
        <span className="px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 font-bold text-[10px]">
          {margin}% Margin
        </span>
      ),
    },
  ];
}
