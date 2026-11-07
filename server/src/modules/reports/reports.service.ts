import Decimal from 'decimal.js';
import { calculateProfit, calculateMargin } from './formulas';
import { getProjectFinancials, getOverdueInvoices } from './reports.repository';

export async function getProjectProfitabilityReport(projectId: string) {
  const financials = await getProjectFinancials(projectId);
  const { revenue, billed, collected, expenses } = financials;

  const estimatedProfitability = calculateProfit(revenue, expenses);
  const margin = calculateMargin(revenue, estimatedProfitability);

  const billedDec = new Decimal(billed || '0');
  const collectedDec = new Decimal(collected || '0');
  const progress = billedDec.gt(0)
    ? Number(collectedDec.dividedBy(billedDec).times(100).toFixed(2))
    : 0;

  return {
    projectId: String(projectId),
    revenue,
    billed,
    collected,
    expenses,
    estimatedProfitability,
    margin,
    progress,
  };
}

export async function getOverdueInvoicesReport(asOfDate: Date) {
  return getOverdueInvoices(asOfDate);
}

