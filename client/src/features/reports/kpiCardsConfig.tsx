import type { DashboardFinancials } from "./types";
import type { KpiCardProps } from "./KpiCard";
import { getPrimaryKpis } from "./kpiPrimaryCards";
import { getSecondaryKpis } from "./kpiSecondaryCards";

export type { KpiCardProps as KpiCardData };

export function getKpiCards(
  f?: DashboardFinancials | null,
  isError?: boolean,
): KpiCardProps[] {
  return [...getPrimaryKpis(f, isError), ...getSecondaryKpis(f, isError)];
}
