import { FollowUpQuery, CreateFollowUpInput, UpdateFollowUpInput } from './followups.schemas';
import { FollowUpRepository } from './followups.repository';
import { LeadRepository } from '../leads/leads.repository';
import { formatFollowUp } from './followups.formatter';
import { ApiError } from '../../shared/errors';

const toBigIntId = (id: string | bigint): bigint => {
  try { return BigInt(id); } catch { throw new ApiError(404, 'NOT_FOUND', 'Invalid ID'); }
};

export async function checkLeadAccess(leadId: string | bigint, user: any) {
  const rawLeadId = toBigIntId(leadId);
  const lead = await LeadRepository.findById(rawLeadId);
  if (!lead) throw new ApiError(404, 'NOT_FOUND', 'Lead not found');
  const userId = BigInt(user.userId ?? user.id);
  if (user?.role === 'STAFF' && lead.ownerId !== userId) {
    throw new ApiError(403, 'FORBIDDEN', 'Not authorized to access follow-ups for this lead');
  }
  return lead;
}

export async function listFollowUps(query: FollowUpQuery, user: any) {
  const skip = (query.page - 1) * query.limit;
  let filterLeadId: bigint | bigint[] | undefined;

  if (query.leadId) {
    await checkLeadAccess(query.leadId, user);
    filterLeadId = toBigIntId(query.leadId);
  } else if (user?.role === 'STAFF') {
    const userId = BigInt(user.userId ?? user.id);
    const ownedIds = await LeadRepository.findIdsByOwner(userId);
    if (ownedIds.length === 0) {
      return { data: [], meta: { total: 0, page: query.page, limit: query.limit, totalPages: 1 } };
    }
    filterLeadId = ownedIds;
  }

  const [items, total] = await FollowUpRepository.findMany({
    skip,
    take: query.limit,
    leadId: filterLeadId,
    status: query.status,
    overdue: query.overdue,
  });

  return {
    data: items.map((item) => formatFollowUp(item)),
    meta: {
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit) || 1,
    },
  };
}

export async function createFollowUp(data: CreateFollowUpInput, user: any) {
  await checkLeadAccess(data.leadId, user);
  const createdBy = BigInt(user.userId ?? user.id);
  const created = await FollowUpRepository.create({
    leadId: toBigIntId(data.leadId),
    scheduledAt: data.scheduledAt,
    status: data.status,
    type: data.type,
    createdBy,
  });
  return formatFollowUp(created, data.notes);
}

export async function updateFollowUp(id: string | bigint, data: UpdateFollowUpInput, user: any) {
  const rawId = toBigIntId(id);
  const followUp = await FollowUpRepository.findById(rawId);
  if (!followUp) throw new ApiError(404, 'NOT_FOUND', 'Follow-up not found');
  await checkLeadAccess(followUp.leadId, user);
  if (data.leadId && toBigIntId(data.leadId) !== followUp.leadId) {
    await checkLeadAccess(data.leadId, user);
  }

  const updated = await FollowUpRepository.update(rawId, {
    scheduledAt: data.scheduledAt,
    status: data.status,
    type: data.type,
  });
  return formatFollowUp(updated, data.notes);
}

export const FollowUpsService = { checkLeadAccess, listFollowUps, createFollowUp, updateFollowUp };
export default FollowUpsService;
