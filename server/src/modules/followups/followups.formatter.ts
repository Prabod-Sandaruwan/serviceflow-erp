import { isOverdueColombo } from '../../lib/date';

export function formatFollowUp(f: any, notes?: string) {
  const status =
    f.status === 'SCHEDULED' ? 'PENDING' : f.status === 'COMPLETED' ? 'DONE' : f.status;
  const scheduledAt = f.follow_up_date ?? f.scheduledAt;
  const schedDate = new Date(scheduledAt);
  return {
    id: f.id.toString(),
    leadId: f.leadId?.toString() ?? f.lead_id?.toString(),
    scheduledAt: scheduledAt instanceof Date ? scheduledAt.toISOString() : scheduledAt,
    status,
    notes: notes ?? f.notes ?? null,
    isOverdue: isOverdueColombo(schedDate, status),
    createdBy: f.createdBy?.toString() ?? f.created_by?.toString(),
    createdAt: f.created_at ?? f.createdAt,
    updatedAt: f.updated_at ?? f.updatedAt,
  };
}

export default formatFollowUp;
