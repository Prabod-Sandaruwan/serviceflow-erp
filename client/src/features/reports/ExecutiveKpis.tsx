import type { DashboardFinancials } from "./types";
import { KpiCard } from "./KpiCard";
import { getKpiCards } from "./kpiCardsConfig";

export function ExecutiveKpis({
  f,
  isLoading,
  isError,
}: {
  f?: DashboardFinancials | null;
  isLoading?: boolean;
  isError?: boolean;
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="h-3 w-20 animate-pulse rounded bg-slate-200" />
            <div
              className="mt-3 h-8 w-28 animate-pulse rounded bg-slate-200"
              data-testid="kpi-loading-skeleton"
            />
          </div>
        ))}
      </div>
    );
  }

  const cards = getKpiCards(f, isError);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map((c) => (
        <KpiCard key={c.title} {...c} />
      ))}
    </div>
  );
}

export default ExecutiveKpis;
