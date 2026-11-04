export interface Task {
  id: string;
  projectId: string;
  milestoneId?: string | null;
  title: string;
  description?: string | null;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' | string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED' | string;
  dueDate?: string | null;
  assigneeId?: string | null;
  isOverdue?: boolean;
  assignee?: { id: string; fullName: string };
  milestone?: { id: string; name?: string; title?: string };
  createdAt: string;
  updatedAt: string;
}

export interface TasksResponse {
  data: Task[];
  meta: { page: number; pageSize: number; total: number; totalPages?: number };
}

export interface CreateTaskInput {
  title: string;
  description?: string | null;
  assigneeId?: string | null;
  priority?: string;
  milestoneId?: string | null;
  dueDate?: string | null;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  assigneeId?: string | null;
  priority?: string;
  milestoneId?: string | null;
  dueDate?: string | null;
  status?: string;
}

export interface TaskQueryParams {
  projectId?: string;
  milestoneId?: string;
  assigneeId?: string;
  priority?: string;
  status?: string;
  overdue?: boolean | string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: number | string;
  pageSize?: number | string;
}
