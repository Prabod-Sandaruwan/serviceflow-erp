import { api } from '../../lib/api';
import type { Task, TasksResponse } from './types';

const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;

export async function downloadAllTasksCsv(fallbackTasks: Task[] = []) {
  let tasks = fallbackTasks;
  try {
    const res = await api.get<TasksResponse>('/tasks?pageSize=100&page=1');
    if (res?.data && res.data.length > 0) {
      tasks = [...res.data];
      const totalPages = res.meta?.totalPages || 1;
      for (let p = 2; p <= Math.min(totalPages, 10); p++) {
        const next = await api.get<TasksResponse>(`/tasks?pageSize=100&page=${p}`);
        if (next?.data?.length) tasks.push(...next.data);
      }
    }
  } catch {
    // fallback to provided tasks
  }

  const headers = ['Task ID', 'Title', 'Priority', 'Status', 'Assignee', 'Due Date', 'Project ID', 'Created At'];
  const rows = tasks.map((t) => [
    escape(t.id),
    escape(t.title),
    escape(t.priority),
    escape(t.status),
    escape(t.assignee?.fullName || ''),
    escape(t.dueDate || '-'),
    escape(t.projectId || ''),
    escape(t.createdAt ? new Date(t.createdAt).toLocaleDateString() : ''),
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL ? window.URL.createObjectURL(blob) : '';
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `tasks_export_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  if (window.URL?.revokeObjectURL) window.URL.revokeObjectURL(url);
}

export default downloadAllTasksCsv;
