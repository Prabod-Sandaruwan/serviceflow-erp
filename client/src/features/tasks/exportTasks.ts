import { api } from '../../lib/api';
import type { Task, TasksResponse } from './types';

export async function downloadAllTasksCsv(fallbackTasks: Task[] = []) {
  let tasks = fallbackTasks;
  try {
    const res = await api.get<TasksResponse>('/tasks?pageSize=1000');
    if (res?.data && res.data.length > 0) tasks = res.data;
  } catch {
    // fallback to provided tasks
  }

  const headers = ['Task ID', 'Title', 'Priority', 'Status', 'Assignee', 'Due Date', 'Project ID', 'Created At'];
  const rows = tasks.map((t) => [
    `#${t.id}`,
    `"${(t.title || '').replace(/"/g, '""')}"`,
    t.priority,
    t.status,
    `"${(t.assignee?.fullName || '').replace(/"/g, '""')}"`,
    t.dueDate || '-',
    t.projectId || '',
    t.createdAt ? new Date(t.createdAt).toLocaleDateString() : '',
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `tasks_export_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default downloadAllTasksCsv;
