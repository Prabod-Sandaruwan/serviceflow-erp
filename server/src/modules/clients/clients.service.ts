import { Prisma } from '@prisma/client';
import {
  findMany,
  findById,
  checkDuplicate,
  isClientOwnedByStaff,
  create,
  update,
} from './clients.repository';
import { ClientQuery, CreateClientInput, UpdateClientInput } from './clients.schemas';
import { formatClient } from './clients.formatter';
import { ApiError } from '../../shared/errors';
import { AuditService } from '../audit/audit.service';

const toBigIntId = (id: string | bigint): bigint => {
  try {
    return BigInt(id);
  } catch {
    throw new ApiError(404, 'NOT_FOUND', 'Client not found');
  }
};

export async function listClients(query: ClientQuery) {
  const skip = (query.page - 1) * query.limit;
  let orderBy: Record<string, Prisma.SortOrder> = { created_at: 'desc' };
  if (query.sort) {
    const isDesc = query.sort.startsWith('-');
    const raw = isDesc ? query.sort.slice(1) : query.sort;
    orderBy = { [raw === 'displayName' ? 'display_name' : 'created_at']: isDesc ? 'desc' : 'asc' };
  }
  const [clients, total] = await findMany({
    skip,
    take: query.limit,
    search: query.search,
    type: query.type,
    isActive: query.isActive,
    orderBy: orderBy as Prisma.ClientOrderByWithRelationInput,
  });
  return {
    data: clients.map(formatClient),
    meta: {
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit) || 1,
    },
  };
}

export async function getClient(id: string | bigint) {
  const rawId = toBigIntId(id);
  const client = await findById(rawId);
  if (!client) throw new ApiError(404, 'NOT_FOUND', 'Client not found');
  return formatClient(client);
}

export async function createClient(data: CreateClientInput, user?: any) {
  const duplicateWarning = await checkDuplicate(data.email, data.registrationNumber);
  const newClient = await create(data);
  const formatted = formatClient(newClient);
  const actorId = user?.userId ?? user?.id;

  if (actorId) {
    await AuditService.log({
      action: 'CLIENT_CREATED',
      entityType: 'CLIENT',
      entityId: newClient.id,
      actorUserId: actorId,
      actorRole: user?.role,
      after: formatted,
    });
  }
  return { data: formatted, duplicateWarning };
}

export async function updateClient(id: string | bigint, data: UpdateClientInput, user?: any) {
  const rawId = toBigIntId(id);
  const existing = await findById(rawId);
  if (!existing) throw new ApiError(404, 'NOT_FOUND', 'Client not found');

  const actorRole = user?.role;
  const actorId = user?.userId ?? user?.id;

  if (actorRole === 'STAFF') {
    if (data.isActive !== undefined)
      throw new ApiError(403, 'FORBIDDEN', 'Staff cannot change active status');
    const isOwned = await isClientOwnedByStaff(rawId, BigInt(actorId));
    if (!isOwned) throw new ApiError(403, 'FORBIDDEN', 'Not authorized to edit this client');
  }

  const email = data.email !== undefined ? data.email : existing.email;
  const regNumber =
    data.registrationNumber !== undefined ? data.registrationNumber : existing.registration_number;
  const duplicateWarning = await checkDuplicate(email, regNumber, rawId);

  const updated = await update(rawId, data);
  const formatted = formatClient(updated);

  if (actorId) {
    await AuditService.log({
      action: 'CLIENT_UPDATED',
      entityType: 'CLIENT',
      entityId: rawId,
      actorUserId: actorId,
      actorRole,
      before: formatClient(existing),
      after: formatted,
    });
  }
  return { data: formatted, duplicateWarning };
}

export const ClientsService = { listClients, getClient, createClient, updateClient };
export default ClientsService;
