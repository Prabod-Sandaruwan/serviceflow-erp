import prisma from '../../config/prisma';
import { Prisma } from '../../generated/prisma';
import { today } from '../../shared/dates';

export interface InvoiceFilters {
  status?: any;
  clientId?: string;
  projectId?: string;
  overdue?: boolean;
  from?: string;
  to?: string;
}

export interface PaginationParams {
  skip?: number;
  take?: number;
}

export async function findMany(
  filters: InvoiceFilters,
  pagination?: PaginationParams,
  actorEmployeeId?: bigint
) {
  const where: Prisma.InvoiceWhereInput = {};
  if (filters.status) where.status = filters.status;
  if (filters.projectId) {
    try { where.projectId = BigInt(filters.projectId); } catch { /* ignore */ }
  }

  const projectWhere: Prisma.ProjectWhereInput = {};
  if (filters.clientId) {
    try { projectWhere.clientId = BigInt(filters.clientId); } catch { /* ignore */ }
  }
  if (actorEmployeeId !== undefined) {
    projectWhere.tasks = { some: { assigneeId: actorEmployeeId, status: { not: 'CANCELLED' } } };
  }
  if (Object.keys(projectWhere).length > 0) {
    where.project = projectWhere;
  }

  if (filters.from || filters.to) {
    where.issueDate = {};
    if (filters.from) (where.issueDate as any).gte = new Date(filters.from);
    if (filters.to) (where.issueDate as any).lte = new Date(filters.to);
  }

  if (filters.overdue) {
    where.dueDate = { lt: new Date(today()) };
    where.status = { in: ['ISSUED', 'PARTIALLY_PAID'] };
  }

  return Promise.all([
    prisma.invoice.findMany({
      where,
      skip: pagination?.skip,
      take: pagination?.take,
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        project: { include: { client: true } },
        payments: true,
      },
    }),
    prisma.invoice.count({ where }),
  ]);
}

export async function findById(id: bigint, actorEmployeeId?: bigint) {
  const where: Prisma.InvoiceWhereInput = { id };
  if (actorEmployeeId !== undefined) {
    where.project = {
      tasks: {
        some: { assigneeId: actorEmployeeId, status: { not: 'CANCELLED' } },
      },
    };
  }
  return prisma.invoice.findFirst({
    where,
    include: {
      items: true,
      project: { include: { client: true } },
      milestone: true,
      payments: true,
    },
  });
}

