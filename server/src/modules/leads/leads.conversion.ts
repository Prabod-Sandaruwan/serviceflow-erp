import prisma from '../../lib/prisma';
import { findById } from './leads.repository';
import { formatClient } from '../clients/clients.formatter';
import { ApiError } from '../../shared/errors';
import { AuditService } from '../audit/audit.service';

export async function convertLead(
  id: string | bigint,
  data: { existingClientId?: string },
  user?: any
) {
  let rawId: bigint;
  try {
    rawId = BigInt(id);
  } catch {
    throw new ApiError(404, 'NOT_FOUND', 'Lead not found');
  }

  const lead = await findById(rawId);
  if (!lead) throw new ApiError(404, 'NOT_FOUND', 'Lead not found');

  const callerId = user?.userId ?? user?.id ? BigInt(user.userId ?? user.id) : null;
  if (user?.role === 'STAFF' && lead.ownerId !== callerId) {
    throw new ApiError(403, 'FORBIDDEN', 'Not authorized to convert this lead');
  }

  if ((lead.status as string) === 'WON' || lead.status === 'CONVERTED' || lead.convertedClientId) {
    throw new ApiError(409, 'LEAD_ALREADY_CONVERTED', 'Lead has already been converted');
  }

  return prisma.$transaction(async (tx) => {
    let client: any;
    if (data.existingClientId) {
      let extId: bigint;
      try {
        extId = BigInt(data.existingClientId);
      } catch {
        throw new ApiError(404, 'NOT_FOUND', 'Client not found');
      }
      const found = await tx.client.findUnique({ where: { id: extId } });
      if (!found) throw new ApiError(404, 'NOT_FOUND', 'Client not found');
      client = found;
    } else {
      client = await tx.client.create({
        data: {
          display_name: (lead as any).title || `Client - Lead #${lead.id}`,
          client_type: 'COMPANY',
        },
      });
    }

    const updateResult = await tx.lead.updateMany({
      where: { id: lead.id, convertedClientId: null },
      data: { convertedClientId: client.id, status: 'CONVERTED' },
    });

    if (updateResult.count === 0) {
      throw new ApiError(409, 'LEAD_ALREADY_CONVERTED', 'Lead has already been converted');
    }

    if (callerId) {
      await AuditService.log({
        action: 'LEAD_CONVERTED',
        entityType: 'LEAD',
        entityId: lead.id,
        actorUserId: callerId,
        actorRole: user?.role,
      });
    }

    return formatClient(client);
  });
}

export default convertLead;
