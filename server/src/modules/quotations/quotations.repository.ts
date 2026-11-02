import prisma from '../../config/prisma';
import { Prisma } from '../../generated/prisma';

export interface QuotationFilters {
  status?: string;
  clientId?: bigint;
  createdBy?: bigint;
  search?: string;
}

export interface PaginationParams {
  skip?: number;
  take?: number;
}

const userInclude = {
  select: {
    id: true,
    email: true,
    employee: { select: { full_name: true } },
  },
};

export async function findMany(filters: QuotationFilters, pagination?: PaginationParams) {
  const where: Prisma.QuotationWhereInput = {};
  if (filters.status) where.status = filters.status as any;
  if (filters.clientId) where.clientId = filters.clientId;
  if (filters.createdBy) where.createdBy = filters.createdBy;
  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search } },
      { quotationNumber: { contains: filters.search } },
    ];
  }

  return Promise.all([
    prisma.quotation.findMany({
      where,
      skip: pagination?.skip,
      take: pagination?.take,
      orderBy: { createdAt: 'desc' },
      include: { creator: userInclude, approver: userInclude },
    }),
    prisma.quotation.count({ where }),
  ]);
}

export async function findById(id: bigint) {
  return prisma.quotation.findUnique({
    where: { id },
    include: {
      items: { orderBy: { lineNo: 'asc' } },
      creator: userInclude,
      approver: userInclude,
    },
  });
}

export const QuotationsRepository = { findMany, findById };
export default QuotationsRepository;
