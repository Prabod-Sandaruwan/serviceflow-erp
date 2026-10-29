import { Prisma } from '@prisma/client';
import prisma from '../../lib/prisma';

export interface FindManyClientParams {
  skip?: number;
  take?: number;
  search?: string;
  type?: string;
  isActive?: boolean;
  orderBy?: Prisma.ClientOrderByWithRelationInput;
}

export async function findMany(params: FindManyClientParams) {
  const where: Prisma.ClientWhereInput = {};

  if (params.isActive !== undefined) {
    where.is_active = params.isActive;
  }

  if (params.type) {
    where.client_type = params.type as unknown as Prisma.EnumClientTypeFilter;
  }

  if (params.search) {
    where.OR = [
      { display_name: { contains: params.search } },
      { email: { contains: params.search } },
    ];
  }

  let orderBy = params.orderBy;
  if (orderBy && typeof orderBy === 'object') {
    const normalized: Record<string, Prisma.SortOrder> = {};
    for (const [key, value] of Object.entries(orderBy)) {
      if (key === 'displayName') normalized.display_name = value as Prisma.SortOrder;
      else if (key === 'createdAt') normalized.created_at = value as Prisma.SortOrder;
      else normalized[key] = value as Prisma.SortOrder;
    }
    orderBy = normalized as Prisma.ClientOrderByWithRelationInput;
  }

  return Promise.all([
    prisma.client.findMany({
      where,
      skip: params.skip,
      take: params.take,
      orderBy,
    }),
    prisma.client.count({ where }),
  ]);
}

export const ClientRepository = { findMany };
export default { findMany };
