import prisma from '../../config/prisma';
import { Prisma } from '../../generated/prisma';
import { getColomboToday } from '../../lib/date';

export interface TaskFilters {
  projectId?: bigint | string | number;
  milestoneId?: bigint | string | number;
  assigneeId?: bigint | string | number;
  priority?: any;
  status?: any;
  overdue?: boolean;
  search?: string;
}

export interface PaginationParams {
  skip?: number;
  take?: number;
}

export async function findTaskById(id: bigint) {
  return prisma.task.findUnique({
    where: { id },
    include: { project: true, assignee: true, milestone: true },
  });
}

export async function findMany(filters: TaskFilters, pagination?: PaginationParams) {
  const where: Prisma.TaskWhereInput = {};
  const and: Prisma.TaskWhereInput[] = [];

  if (filters.projectId !== undefined) {
    try {
      and.push({ projectId: BigInt(filters.projectId) });
    } catch {
      // ignore invalid bigint
    }
  }
  if (filters.milestoneId !== undefined) {
    try {
      and.push({ milestoneId: BigInt(filters.milestoneId) });
    } catch {
      // ignore invalid bigint
    }
  }
  if (filters.assigneeId !== undefined) {
    try {
      and.push({ assigneeId: BigInt(filters.assigneeId) });
    } catch {
      // ignore invalid bigint
    }
  }
  if (filters.priority) and.push({ priority: filters.priority });
  if (filters.status && filters.overdue !== true) and.push({ status: filters.status });
  if (filters.search) {
    and.push({
      OR: [{ title: { contains: filters.search } }, { description: { contains: filters.search } }],
    });
  }
  if (filters.overdue === true) {
    and.push({
      dueDate: { lt: getColomboToday() },
      status: filters.status ? filters.status : { notIn: ['DONE', 'CANCELLED'] },
    });
  } else if (filters.overdue === false) {
    and.push({
      OR: [{ dueDate: { gte: getColomboToday() } }, { dueDate: null }, { status: { in: ['DONE', 'CANCELLED'] } }],
    });
  }
  if (and.length > 0) where.AND = and;

  return Promise.all([
    prisma.task.findMany({
      where,
      skip: pagination?.skip,
      take: pagination?.take,
      orderBy: { createdAt: 'desc' },
      include: { assignee: true, milestone: true },
    }),
    prisma.task.count({ where }),
  ]);
}

export const TasksRepository = { findTaskById, findMany };
export default TasksRepository;
