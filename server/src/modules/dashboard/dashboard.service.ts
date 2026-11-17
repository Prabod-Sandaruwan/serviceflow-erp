import Decimal from 'decimal.js';
import prisma from '../../config/prisma';
import {
  getRevenue,
  getPaymentsReceived,
  getExpenses,
  getOutstanding,
  getOverdueInvoices,
} from '../reports/reports.repository';
import { calculateProfit } from '../reports/formulas';
import { getMonthlyTrajectories, getFeaturedProject } from './dashboard.trajectories';
import { getStaffSummary } from './dashboard.staff';

export async function getDashboardSummary(query: any, actor: any) {
  if (actor.role === 'STAFF') {
    return getStaffSummary(actor);
  }

  const now = new Date();
  const [
    activeClients,
    activeProjects,
    milestones,
    todo,
    inProgress,
    done,
    overdue,
    overdueInvoices,
    revenue,
    paymentsReceived,
    expenses,
    outstanding,
    trajectories,
    featuredProject,
  ] = await Promise.all([
    prisma.client.count({ where: { is_active: true } }),
    prisma.project.count({ where: { status: 'ACTIVE' } }),
    prisma.milestone.count(),
    prisma.task.count({ where: { status: 'TODO' } }),
    prisma.task.count({ where: { status: 'IN_PROGRESS' } }),
    prisma.task.count({ where: { status: 'DONE' } }),
    prisma.task.count({
      where: { status: { notIn: ['DONE', 'CANCELLED'] }, dueDate: { lt: now } },
    }),
    getOverdueInvoices(query.endDate),
    getRevenue(query.startDate, query.endDate),
    getPaymentsReceived(query.startDate, query.endDate),
    getExpenses(query.startDate, query.endDate),
    getOutstanding(query.endDate),
    getMonthlyTrajectories(query.endDate),
    getFeaturedProject(),
  ]);

  const overdueSum = overdueInvoices.reduce(
    (acc: Decimal, inv: any) => acc.plus(new Decimal(inv.balance || '0')),
    new Decimal(0)
  );

  return {
    role: actor.role,
    counts: {
      activeClients,
      activeProjects,
      tasks: { total: todo + inProgress + done, todo, inProgress, done, overdue },
      milestones,
    },
    financials: {
      revenue,
      paymentsReceived,
      outstanding,
      overdueOutstanding: overdueSum.toFixed(2),
      overdueCount: overdueInvoices.length,
      expenses,
      estimatedProfit: calculateProfit(revenue, expenses),
    },
    trajectories,
    featuredProject,
  };
}
