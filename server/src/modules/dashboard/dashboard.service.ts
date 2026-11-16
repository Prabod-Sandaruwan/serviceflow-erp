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

export async function getDashboardSummary(query: any, actor: any) {
  if (actor.role === 'STAFF') {
    const whereTasks = {
      OR: [
        ...(actor.employeeId ? [{ assigneeId: BigInt(actor.employeeId) }] : []),
        ...(actor.userId
          ? [{ assigneeId: BigInt(actor.userId) }, { createdBy: BigInt(actor.userId) }]
          : []),
      ],
    };
    const [todo, inProgress, done, leadsCount, quotationsCount] = await Promise.all([
      prisma.task.count({ where: { ...whereTasks, status: 'TODO' } }),
      prisma.task.count({ where: { ...whereTasks, status: 'IN_PROGRESS' } }),
      prisma.task.count({ where: { ...whereTasks, status: 'DONE' } }),
      prisma.lead.count({ where: { ownerId: BigInt(actor.userId) } }),
      prisma.quotation.count({ where: { createdBy: BigInt(actor.userId) } }),
    ]);

    return {
      role: 'STAFF',
      tasks: { total: todo + inProgress + done, todo, inProgress, done },
      leadsCount,
      quotationsCount,
    };
  }

  const now = new Date();
  const [
    activeClients, activeProjects, milestones,
    todo, inProgress, done, overdue,
    overdueInvoices, revenue, paymentsReceived,
    expenses, outstanding, trajectories, featuredProject,
    trajectories,
    featuredProject,
  ] = await Promise.all([
    prisma.client.count({ where: { is_active: true } }),
    prisma.project.count({ where: { status: 'ACTIVE' } }),
    prisma.milestone.count(),
    prisma.task.count({ where: { status: 'TODO' } }),
    prisma.task.count({ where: { status: 'IN_PROGRESS' } }),
    prisma.task.count({ where: { status: 'DONE' } }),
    prisma.task.count({ where: { status: { notIn: ['DONE', 'CANCELLED'] }, dueDate: { lt: now } } }),
    getOverdueInvoices(query.endDate),
    getRevenue(query.startDate, query.endDate),
    getPaymentsReceived(query.startDate, query.endDate),
    getExpenses(query.startDate, query.endDate),
    getOutstanding(query.endDate),
    getMonthlyTrajectories(),
    getFeaturedProject(),
  ]);

  let overdueSum = new Decimal(0);
  for (const inv of overdueInvoices) {
    overdueSum = overdueSum.plus(new Decimal(inv.balance || '0'));
  }

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
