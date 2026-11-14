import { Prisma } from '@prisma/client';
import prisma from '../../lib/prisma';

export interface FindManyClientParams {
  skip?: number; take?: number; search?: string; type?: string; isActive?: boolean;
  orderBy?: Prisma.ClientOrderByWithRelationInput;
}

const mapCreate = (d: any): Prisma.ClientCreateInput => ({
  display_name: d.displayName ?? d.display_name,
  client_type: d.clientType === 'BUSINESS' ? 'COMPANY' : (d.clientType ?? d.client_type ?? 'COMPANY'),
  email: d.email || null, phone: d.phone || null, address: d.address || null,
  registration_number: d.registrationNumber ?? d.registration_number ?? null,
  notes: d.notes || null, is_active: d.isActive ?? d.is_active ?? true,
});

const mapUpdate = (d: any): Prisma.ClientUpdateInput => {
  const u: Prisma.ClientUpdateInput = {};
  if (d.displayName !== undefined || d.display_name !== undefined) u.display_name = d.displayName ?? d.display_name;
  if (d.clientType !== undefined || d.client_type !== undefined) {
    const t = d.clientType ?? d.client_type;
    u.client_type = t === 'BUSINESS' ? 'COMPANY' : t;
  }
  if (d.email !== undefined) u.email = d.email || null;
  if (d.phone !== undefined) u.phone = d.phone || null;
  if (d.address !== undefined) u.address = d.address || null;
  if (d.registrationNumber !== undefined || d.registration_number !== undefined) {
    u.registration_number = d.registrationNumber ?? d.registration_number ?? null;
  }
  if (d.notes !== undefined) u.notes = d.notes || null;
  if (d.isActive !== undefined || d.is_active !== undefined) u.is_active = d.isActive ?? d.is_active;
  return u;
};

export async function findMany(params: FindManyClientParams) {
  const where: Prisma.ClientWhereInput = {};
  if (params.isActive !== undefined) where.is_active = params.isActive;
  if (params.type) where.client_type = params.type as unknown as Prisma.EnumClientTypeFilter;
  if (params.search) {
    where.OR = [{ display_name: { contains: params.search } }, { email: { contains: params.search } }];
  }

  let orderBy = params.orderBy;
  if (orderBy && typeof orderBy === 'object') {
    const norm: Record<string, Prisma.SortOrder> = {};
    for (const [k, v] of Object.entries(orderBy)) {
      norm[k === 'displayName' ? 'display_name' : k === 'createdAt' ? 'created_at' : k] = v as Prisma.SortOrder;
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

export async function checkDuplicate(email?: string | null, regNumber?: string | null, excludeId?: bigint) {
  const conds: Prisma.ClientWhereInput[] = [];
  if (email && email.trim()) conds.push({ email: email.trim() });
  if (regNumber && regNumber.trim()) conds.push({ registration_number: regNumber.trim() });
  if (!conds.length) return false;
  const where: Prisma.ClientWhereInput = { OR: conds, ...(excludeId ? { id: { not: excludeId } } : {}) };
  return (await prisma.client.count({ where })) > 0;
}

export async function isClientOwnedByStaff(clientId: bigint, staffId: bigint) {
  const match = await prisma.client.findFirst({
    where: { id: clientId, OR: [{ lead: { ownerId: staffId } }, { quotations: { some: { createdBy: staffId } } }] },
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

export const ClientRepository = { findMany, findById, checkDuplicate, isClientOwnedByStaff, create, update };
export default ClientRepository;
