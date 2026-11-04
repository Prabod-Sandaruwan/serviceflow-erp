export const formatMilestone = (m: any) => ({
  id: m.id.toString(),
  projectId: m.projectId?.toString() ?? m.project_id?.toString(),
  title: m.name ?? m.title,
  name: m.name ?? m.title,
  description: m.description ?? null,
  sortOrder: m.sortOrder ?? m.sort_order ?? 0,
  status: m.status,
  billingAmount: m.billingAmount != null ? m.billingAmount.toString() : '0',
  dueDate: m.dueDate ? (m.dueDate instanceof Date ? m.dueDate.toISOString().slice(0, 10) : String(m.dueDate).slice(0, 10)) : null,
  completedAt: m.completedAt ?? m.completed_at ?? null,
  approvedAt: m.approvedAt ?? m.approved_at ?? null,
  approvedBy: m.approvedBy?.toString() ?? m.approved_by?.toString() ?? null,
  createdAt: m.createdAt ?? m.created_at,
  updatedAt: m.updatedAt ?? m.updated_at,
});

export default formatMilestone;
