import { api } from '../../lib/api';
import type { FollowUp } from '../leads/types';
import type { FollowUpsListResponse } from './hooks';

const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;

export async function downloadAllFollowUpsCsv(fallback: FollowUp[] = []) {
  let list = fallback;
  try {
    const res = await api.get<FollowUpsListResponse>('/follow-ups?limit=100&page=1');
    if (res?.data && res.data.length > 0) list = [...res.data];
  } catch {
    // fallback
  }

  const headers = ['Follow-up ID', 'Lead ID', 'Scheduled At', 'Status', 'Is Overdue', 'Notes'];
  const rows = list.map((f) => [
    escape(f.id),
    escape(f.leadId),
    escape(f.scheduledAt ? new Date(f.scheduledAt).toLocaleString() : '-'),
    escape(f.status),
    escape(f.isOverdue ? 'Yes' : 'No'),
    escape(f.notes || '-'),
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL ? window.URL.createObjectURL(blob) : '';
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `followups_export_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  if (window.URL?.revokeObjectURL) window.URL.revokeObjectURL(url);
}

export default downloadAllFollowUpsCsv;

