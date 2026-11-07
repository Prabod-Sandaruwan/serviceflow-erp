import Decimal from 'decimal.js';
import { calculateProfit, calculateMargin } from './formulas';
import {
  getRevenue,
  getPaymentsReceived,
  getExpenses,
  getOutstanding,
  getProjectFinancials,
  getOverdueInvoices,
} from './reports.repository';
import prisma from '../../config/prisma';

export async function getFinanceReport(startDate: Date, endDate: Date) {
  const [revenue, paymentsReceived, expenses, outstanding] = await Promise.all([
    getRevenue(startDate, endDate),
    getPaymentsReceived(startDate, endDate),
    getExpenses(startDate, endDate),
    getOutstanding(endDate),
  ]);
  const estimatedProfitability = calculateProfit(revenue, expenses);
  const margin = calculateMargin(revenue, estimatedProfitability);
  return {
    revenue,
    paymentsReceived,
    expenses,
    outstanding,
    estimatedProfitability,
    margin,
  };
}

export async function getProjectsReport(projectId?: string) {
  const where: any = { status: { not: 'CANCELLED' } };
  if (projectId) where.id = BigInt(projectId);
  const projects = await prisma.project.findMany({
    where,
    select: { id: true, name: true, projectCode: true },
  });
  return Promise.all(
    projects.map(async (p) => {
      const rep = await getProjectProfitabilityReport(p.id.toString());
      return { ...rep, name: p.name, projectCode: p.projectCode };
    })
  );
}

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
