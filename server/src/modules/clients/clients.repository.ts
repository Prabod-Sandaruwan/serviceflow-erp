import { Prisma } from '@prisma/client';
import prisma from '../../lib/prisma';
import { mapCreate, mapUpdate, normalizeClientType } from './clients.mapper';

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
  if (params.isActive !== undefined) where.is_active = params.isActive;
  if (params.type) {
    where.client_type = normalizeClientType(params.type) as unknown as Prisma.EnumClientTypeFilter;
  }
  if (params.search) {
    where.OR = [
      { display_name: { contains: params.search } },
      { email: { contains: params.search } },
    ];
  }

  let orderBy = params.orderBy;
  if (orderBy && typeof orderBy === 'object') {
    const norm: Record<string, Prisma.SortOrder> = {};
    for (const [k, v] of Object.entries(orderBy)) {
      norm[k === 'displayName' ? 'display_name' : k === 'createdAt' ? 'created_at' : k] =
        v as Prisma.SortOrder;
    }
    orderBy = norm as Prisma.ClientOrderByWithRelationInput;
  }

  return Promise.all([
    prisma.client.findMany({ where, skip: params.skip, take: params.take, orderBy }),
    prisma.client.count({ where }),
  ]);
}

export async function findById(id: bigint) {
  return prisma.client.findUnique({ where: { id } });
}

export async function checkDuplicate(
  email?: string | null,
  regNumber?: string | null,
  excludeId?: bigint
) {
  const conds: Prisma.ClientWhereInput[] = [];
  if (email && email.trim()) conds.push({ email: email.trim() });
  if (regNumber && regNumber.trim()) conds.push({ registration_number: regNumber.trim() });
  if (!conds.length) return false;
  const where: Prisma.ClientWhereInput = {
    OR: conds,
    ...(excludeId ? { id: { not: excludeId } } : {}),
  };
  return (await prisma.client.count({ where })) > 0;
}

export async function isClientOwnedByStaff(clientId: bigint, staffId: bigint) {
  const match = await prisma.client.findFirst({
    where: {
      id: clientId,
      OR: [{ lead: { ownerId: staffId } }, { quotations: { some: { createdBy: staffId } } }],
    },
    select: { id: true },
  });
  return !!match;
}

export async function create(data: any) {
  return prisma.client.create({ data: mapCreate(data) });
}

export async function update(id: bigint, data: any) {
  return prisma.client.update({ where: { id }, data: mapUpdate(data) });
}

export const ClientRepository = {
  findMany,
  findById,
  checkDuplicate,
  isClientOwnedByStaff,
  create,
  update,
};
export default ClientRepository;
