import { TrendingUp, CreditCard, Receipt } from "lucide-react";
import type { DashboardFinancials } from "./types";
import type { KpiCardProps } from "./KpiCard";

const fmt = (v?: string | number) =>
  v !== undefined && v !== null && v !== ""
    ? `$${Number(v).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : "—";

export function getPrimaryKpis(
  f?: DashboardFinancials | null,
  isError?: boolean,
): KpiCardProps[] {
  const err = (
    <span className="text-sm font-medium text-red-600">
      Error loading metric
    </span>
  );
  const rev = Number(f?.revenue || 0);
  const colRate =
    rev > 0
      ? Math.min(
          100,
          Math.round((Number(f?.paymentsReceived || 0) / rev) * 100),
        )
      : 0;
  const overdueCount = f?.overdueCount ?? 0;

  return [
    {
      title: "Revenue Issued",
      srTitle: "Revenue",
      icon: <TrendingUp className="w-4 h-4" />,
      iconBg: "bg-indigo-50",
      iconColor: "text-indigo-600",
      value: isError ? err : fmt(f?.revenue),
      subtitle: "Issued subtotal",
      badge: (
        <span className="px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-bold text-[10px]">
          {rev > 0 ? "Active billing" : "No volume"}
        </span>
      ),
    },
    {
      title: "Cash Collected",
      srTitle: "Payments Received",
      icon: <CreditCard className="w-4 h-4" />,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      value: isError ? err : fmt(f?.paymentsReceived),
      subtitle: "Net cash inflow",
      badge: (
        <span className="px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">
          {colRate}% Rate
        </span>
      ),
    },
    {
      title: "Total Outstanding",
      srTitle: "Outstanding",
      icon: <Receipt className="w-4 h-4" />,
      iconBg: "bg-slate-100",
      iconColor: "text-slate-600",
      value: isError ? err : fmt(f?.outstanding),
      subtitle: "Receivables",
      badge: (
        <span className="px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold text-[10px]">
          {overdueCount > 0 ? `${overdueCount} Overdue` : "Current"}
        </span>
      ),
    },
  ];
}
