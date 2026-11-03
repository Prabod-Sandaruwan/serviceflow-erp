import prisma from '../../config/prisma';
import { Prisma } from '../../generated/prisma';

export interface ProjectFilters {
  status?: any;
  clientId?: bigint | string;
  search?: string;
}

export interface PaginationParams {
  skip?: number;
  take?: number;
}

export async function findMany(
  filters: ProjectFilters,
  pagination?: PaginationParams,
  actorEmployeeId?: bigint
) {
  const where: Prisma.ProjectWhereInput = {};
  if (filters.status) where.status = filters.status;
  if (filters.clientId) {
    try {
      where.clientId = BigInt(filters.clientId);
    } catch {
      // ignore invalid clientId
    }
  }
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search } },
      { projectCode: { contains: filters.search } },
    ];
  }
  if (actorEmployeeId !== undefined) {
    where.tasks = { some: { assigneeId: actorEmployeeId } };
  }

  return Promise.all([
    prisma.project.findMany({
      where,
      skip: pagination?.skip,
      take: pagination?.take,
      orderBy: { createdAt: 'desc' },
      include: {
        client: { select: { id: true, display_name: true } },
        quotation: { select: { id: true, quotationNumber: true } },
        tasks: { select: { id: true, status: true } },
      },
    }),
    prisma.project.count({ where }),
  ]);
}

export async function findById(id: bigint, actorEmployeeId?: bigint) {
  const where: Prisma.ProjectWhereInput = { id };
  if (actorEmployeeId !== undefined) {
    where.tasks = { some: { assigneeId: actorEmployeeId } };
  }

  return prisma.project.findFirst({
    where,
    include: {
      client: { select: { id: true, display_name: true } },
      quotation: { select: { id: true, quotationNumber: true } },
      milestones: { orderBy: { sortOrder: 'asc' } },
      tasks: { orderBy: { createdAt: 'asc' } },
    },
  });
}

export const ProjectsRepository = { findMany, findById };
export default ProjectsRepository;

