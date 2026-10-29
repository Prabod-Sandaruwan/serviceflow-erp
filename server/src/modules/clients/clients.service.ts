import { Prisma } from '@prisma/client';
import { findMany } from './clients.repository';
import { ClientQuery } from './clients.schemas';

export async function listClients(query: ClientQuery) {
  const skip = (query.page - 1) * query.limit;

  let orderBy: Record<string, Prisma.SortOrder> = { created_at: 'desc' };
  if (query.sort) {
    const isDesc = query.sort.startsWith('-');
    const rawField = isDesc ? query.sort.slice(1) : query.sort;
    const direction: Prisma.SortOrder = isDesc ? 'desc' : 'asc';
    const field = rawField === 'displayName' ? 'display_name' : 'created_at';
    orderBy = { [field]: direction };
  }

  const [clients, total] = await findMany({
    skip,
    take: query.limit,
    search: query.search,
    type: query.type,
    isActive: query.isActive,
    orderBy: orderBy as Prisma.ClientOrderByWithRelationInput,
  });

  const data = clients.map((client) => ({
    ...client,
    id: client.id.toString(),
    displayName: client.display_name,
    type: client.client_type,
    clientType: client.client_type,
    isActive: client.is_active,
    createdAt: client.created_at,
    updatedAt: client.updated_at,
  }));

  const totalPages = Math.ceil(total / query.limit) || (total === 0 ? 0 : 1);

  return {
    data,
    meta: {
      total,
      page: query.page,
      limit: query.limit,
      totalPages,
    },
  };
}

export const ClientsService = { listClients };
export default { listClients };
