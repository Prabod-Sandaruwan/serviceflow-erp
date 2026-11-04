import { ListTasksQuery } from './tasks.schemas';
import { formatTask } from './tasks.formatter';
import { findMany, TaskFilters } from './tasks.repository';

type Actor = { userId?: bigint | string; role?: string; employeeId?: bigint | string | null };

export async function getTasks(query: ListTasksQuery, actor?: Actor) {
  let assigneeId = query.assigneeId;
  if (actor?.role === 'STAFF') {
    assigneeId = actor.employeeId != null ? actor.employeeId : -1n;
  }

  const filters: TaskFilters = {
    projectId: query.projectId,
    milestoneId: query.milestoneId,
    assigneeId,
    priority: query.priority,
    status: query.status,
    overdue: query.overdue,
    search: query.search,
  };

  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 20;

  const [items, total] = await findMany(
    filters,
    { skip: (page - 1) * pageSize, take: pageSize },
    { by: query.sortBy, order: query.sortOrder }
  );

  return {
    data: items.map(formatTask),
    meta: { page, pageSize, total },
  };
}
