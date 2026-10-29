import { Prisma } from '../../lib/prisma';
import { findMany, findById, create, update } from './leads.repository';
import { LeadQuery, CreateLeadInput, UpdateLeadInput } from './leads.schemas';
import { formatLead } from './leads.formatter';
import { assertLeadTransition, type LeadStatus } from './leads.machine';
import { ApiError } from '../../shared/errors';
import { AuditService } from '../audit/audit.service';

const toBigIntId = (id: string | bigint): bigint => {
  try { return BigInt(id); } catch { throw new ApiError(404, 'NOT_FOUND', 'Lead not found'); }
};

export async function listLeads(query: LeadQuery, user?: any) {
  const skip = (query.page - 1) * query.limit;
  const isStaff = user?.role === 'STAFF';
  const ownerId = isStaff ? toBigIntId(user.userId ?? user.id) : query.ownerId ? toBigIntId(query.ownerId) : undefined;
  let orderBy: Record<string, Prisma.SortOrder> = { created_at: 'desc' };
  if (query.sort) {
    const isDesc = query.sort.startsWith('-');
    const raw = isDesc ? query.sort.slice(1) : query.sort;
    orderBy = { [raw === 'expectedValue' ? 'expected_value' : 'created_at']: isDesc ? 'desc' : 'asc' };
  }
  const [leads, total] = await findMany({
    skip, take: query.limit, status: query.status, ownerId, orderBy: orderBy as Prisma.LeadOrderByWithRelationInput,
  });
  return {
    data: leads.map(formatLead),
    meta: { total, page: query.page, limit: query.limit, totalPages: Math.ceil(total / query.limit) || 1 },
  };
}

export async function getLead(id: string | bigint, user?: any) {
  const rawId = toBigIntId(id);
  const lead = await findById(rawId);
  if (!lead) throw new ApiError(404, 'NOT_FOUND', 'Lead not found');
  if (user?.role === 'STAFF' && lead.ownerId !== toBigIntId(user.userId ?? user.id)) {
    throw new ApiError(403, 'FORBIDDEN', 'Not authorized to access this lead');
  }
  return formatLead(lead);
}

export async function createLead(data: CreateLeadInput, user?: any) {
  const callerId = toBigIntId(user?.userId ?? user?.id);
  const ownerId = user?.role === 'STAFF' || !data.ownerId ? callerId : toBigIntId(data.ownerId);
  const newLead = await create({ ownerId, expectedValue: data.expectedValue });
  const formatted = formatLead(newLead);
  await AuditService.log({
    action: 'LEAD_CREATED', entityType: 'LEAD', entityId: newLead.id, actorUserId: callerId, actorRole: user?.role, after: formatted,
  });
  return formatted;
}

export async function updateLead(id: string | bigint, data: UpdateLeadInput, user?: any) {
  const rawId = toBigIntId(id);
  const existing = await findById(rawId);
  if (!existing) throw new ApiError(404, 'NOT_FOUND', 'Lead not found');
  const callerId = toBigIntId(user?.userId ?? user?.id);
  if (user?.role === 'STAFF' && existing.ownerId !== callerId) {
    throw new ApiError(403, 'FORBIDDEN', 'Not authorized to edit this lead');
  }
  if (existing.status === 'CONVERTED') {
    if (data.status || data.expectedValue !== undefined || data.ownerId || data.lostReason) {
      throw new ApiError(409, 'INVALID_STATE_TRANSITION', 'Converted leads are read-only except for notes');
    }
  }
  if (data.status) {
    assertLeadTransition(existing.status as LeadStatus, data.status, user?.role);
    if (data.status === 'LOST' && (!data.lostReason || !data.lostReason.trim())) {
      throw new ApiError(422, 'VALIDATION_ERROR', 'lostReason is required when status is LOST');
    }
  }
  if (data.ownerId !== undefined && user?.role === 'STAFF') {
    throw new ApiError(403, 'FORBIDDEN', 'Staff cannot reassign lead ownership');
  }
  const updated = await update(rawId, {
    status: data.status, lostReason: data.lostReason, expectedValue: data.expectedValue,
    ownerId: data.ownerId ? toBigIntId(data.ownerId) : undefined,
  });
  const formatted = formatLead(updated);
  await AuditService.log({
    action: 'LEAD_UPDATED', entityType: 'LEAD', entityId: rawId, actorUserId: callerId, actorRole: user?.role, before: formatLead(existing), after: formatted,
  });
  return formatted;
}

export const LeadsService = { listLeads, getLead, createLead, updateLead };
export default LeadsService;
