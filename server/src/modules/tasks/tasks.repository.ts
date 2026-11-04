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

export interface TaskSortParams {
  by?: string;
  order?: 'asc' | 'desc';
}

export async function findTaskById(id: bigint) {
  return prisma.task.findUnique({
    where: { id },
    include: { project: true, assignee: true, milestone: true },
  });
}

export async function findMany(filters: TaskFilters, pagination?: PaginationParams, sort?: TaskSortParams) {
  const where: Prisma.TaskWhereInput = {};
  const and: Prisma.TaskWhereInput[] = [];

  if (filters.projectId !== undefined) {
    try { and.push({ projectId: BigInt(filters.projectId) }); } catch {}
  }
  if (filters.milestoneId !== undefined) {
    try { and.push({ milestoneId: BigInt(filters.milestoneId) }); } catch {}
  }
  if (filters.assigneeId !== undefined) {
    try { and.push({ assigneeId: BigInt(filters.assigneeId) }); } catch {}
  }
  if (filters.priority) and.push({ priority: filters.priority });
  if (filters.status && filters.overdue !== true) and.push({ status: filters.status });
  if (filters.search) {
    and.push({ OR: [{ title: { contains: filters.search } }, { description: { contains: filters.search } }] });
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

  const orderDir = sort?.order === 'asc' ? 'asc' : 'desc';
  const orderBy: any = sort?.by && ['createdAt', 'dueDate', 'priority', 'title', 'status'].includes(sort.by)
    ? { [sort.by]: orderDir }
    : { createdAt: 'desc' };

  return Promise.all([
    prisma.task.findMany({
      where,
      skip: pagination?.skip,
      take: pagination?.take,
      orderBy,
      include: { assignee: true, milestone: true },
    }),
    prisma.task.count({ where }),
  ]);
}

export const TasksRepository = { findTaskById, findMany };
export default TasksRepository;
