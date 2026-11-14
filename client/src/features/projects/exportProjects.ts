import { api } from '../../lib/api';
import type { Project, ProjectsResponse } from './types';

const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;

export async function downloadAllProjectsCsv(fallback: Project[] = []) {
  let list = fallback;
  try {
    const res = await api.get<ProjectsResponse>('/projects?pageSize=100&page=1');
    if (res?.data && res.data.length > 0) {
      list = [...res.data];
    }
  } catch {
    // fallback
  }

  const headers = ['Project Code', 'Name', 'Client', 'Status', 'Progress', 'Budget Amount', 'Start Date', 'End Date'];
  const rows = list.map((p) => [
    escape(p.projectCode),
    escape(p.name),
    escape(p.client?.displayName || '-'),
    escape(p.status),
    escape(`${p.progressPercent || 0}%`),
    escape(p.budgetAmount || '-'),
    escape(p.startDate || '-'),
    escape(p.endDate || '-'),
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL ? window.URL.createObjectURL(blob) : '';
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `projects_export_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  if (window.URL?.revokeObjectURL) window.URL.revokeObjectURL(url);
}

export default downloadAllProjectsCsv;

