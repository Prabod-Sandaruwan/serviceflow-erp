import type { ReactNode } from "react";

export interface KpiCardProps {
  title: string;
  srTitle: string;
  icon: ReactNode;
  iconBg: string;
  iconColor: string;
  value: ReactNode;
  subtitle: ReactNode;
  badge: ReactNode;
  cardClass?: string;
  valueClass?: string;
}

export function KpiCard({
  title,
  srTitle,
  icon,
  iconBg,
  iconColor,
  value,
  subtitle,
  badge,
  cardClass = "border-slate-200 bg-white",
  valueClass = "text-slate-900",
}: KpiCardProps) {
  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm hover:shadow-md transition-shadow ${cardClass}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500">
          {title}
        </span>
        <span className="text-xs sr-only">{srTitle}</span>
        <div className={`p-2 rounded-xl ${iconBg} ${iconColor}`}>{icon}</div>
      </div>
      <div className={`mt-3 text-2xl font-black tracking-tight ${valueClass}`}>
        {value}
      </div>
      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="text-slate-400">{subtitle}</span>
        {badge}
      </div>
    </div>
  );
}

export default KpiCard;
