import { isOverdueTask } from '../../shared/dates';

export const formatTask = (t: any) => ({
  id: t.id.toString(),
  projectId: t.projectId?.toString() ?? t.project_id?.toString(),
  milestoneId: t.milestoneId?.toString() ?? t.milestone_id?.toString() ?? null,
  title: t.title,
  description: t.description ?? null,
  priority: t.priority,
  status: t.status,
  dueDate: t.dueDate
    ? t.dueDate instanceof Date
      ? t.dueDate.toISOString().slice(0, 10)
      : String(t.dueDate).slice(0, 10)
    : null,
  assigneeId: t.assigneeId?.toString() ?? t.assignee_id?.toString() ?? null,
  createdBy: t.createdBy?.toString() ?? t.created_by?.toString(),
  createdAt: t.createdAt ?? t.created_at,
  updatedAt: t.updatedAt ?? t.updated_at,
  isOverdue: isOverdueTask(t),
  assignee: t.assignee ? { id: t.assignee.id.toString(), fullName: t.assignee.full_name } : undefined,
  milestone: t.milestone ? { id: t.milestone.id.toString(), name: t.milestone.name } : undefined,
});

export default formatTask;
