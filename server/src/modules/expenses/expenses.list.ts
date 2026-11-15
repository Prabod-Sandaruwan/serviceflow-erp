import prisma from '../../config/prisma';
import { Prisma } from '../../generated/prisma';
import { ListExpensesQuery } from './expenses.schemas';
import { formatExpense } from './expenses.formatter';
import { toDbCategory } from './expenses.mutate';

const toStart = (d: string) =>
  d.includes('T') ? new Date(d) : new Date(`${d.slice(0, 10)}T00:00:00.000Z`);
const toEnd = (d: string) =>
  d.includes('T') ? new Date(d) : new Date(`${d.slice(0, 10)}T23:59:59.999Z`);

export async function listExpenses(query: ListExpensesQuery, actor?: any, _ctx?: any) {
  const where: Prisma.ExpenseWhereInput = {};

  if (query.status && query.status !== 'ALL') {
    where.status = query.status as any;
  }

  if (query.projectId) {
    try {
      where.projectId = BigInt(query.projectId);
    } catch {
      // ignore
    }
  }

  if (query.category) {
    where.category = toDbCategory(query.category);
  }

  if (query.from || query.to) {
    const dateFilter: Prisma.DateTimeFilter = {};
    if (query.from) dateFilter.gte = toStart(query.from);
    if (query.to) dateFilter.lte = toEnd(query.to);
    where.expenseDate = dateFilter;
  }

  if (actor?.role === 'STAFF') {
    const empId = actor.employeeId ? BigInt(actor.employeeId) : -1n;
    where.project = {
      tasks: { some: { assigneeId: empId, status: { not: 'CANCELLED' } } },
    };
  }

  const items = await prisma.expense.findMany({
    where,
    orderBy: [{ expenseDate: 'desc' }, { id: 'desc' }],
  });

  return items.map(formatExpense);
}
