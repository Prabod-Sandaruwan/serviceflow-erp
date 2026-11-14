import { api } from '../../lib/api';
import type { Lead, LeadsResponse } from './types';

const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;

export async function downloadAllLeadsCsv(fallbackLeads: Lead[] = []) {
  let leads = fallbackLeads;
  try {
    const res = await api.get<LeadsResponse>('/leads?limit=100&page=1');
    if (res?.data && res.data.length > 0) {
      leads = [...res.data];
      const totalPages = res.meta?.totalPages || 1;
      for (let p = 2; p <= Math.min(totalPages, 10); p++) {
        const next = await api.get<LeadsResponse>(`/leads?limit=100&page=${p}`);
        if (next?.data?.length) leads.push(...next.data);
      }
    }
  } catch {
    // fallback to currently displayed leads
  }

  const headers = ['Lead ID', 'Title', 'Status', 'Expected Value', 'Owner', 'Converted Client ID', 'Created At'];
  const rows = leads.map((l) => [
    escape(l.id),
    escape(l.title || `Lead #${l.id}`),
    escape(l.status),
    escape(l.expectedValue != null ? l.expectedValue : ''),
    escape(l.owner?.fullName || l.owner?.email || l.ownerId || ''),
    escape(l.convertedClientId ? `CLI-${l.convertedClientId}` : ''),
    escape(l.createdAt ? new Date(l.createdAt).toLocaleDateString() : ''),
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL ? window.URL.createObjectURL(blob) : '';
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `leads_export_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  if (window.URL?.revokeObjectURL) window.URL.revokeObjectURL(url);
}

export default downloadAllLeadsCsv;
