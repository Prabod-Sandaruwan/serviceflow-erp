import { api } from '../../lib/api';
import type { Lead, LeadsResponse } from './types';

export async function downloadAllLeadsCsv(fallbackLeads: Lead[] = []) {
  let leads = fallbackLeads;
  try {
    const res = await api.get<LeadsResponse>('/leads?limit=1000');
    if (res?.data && res.data.length > 0) leads = res.data;
  } catch {
    // fallback to currently displayed leads
  }

  const headers = ['Lead ID', 'Title', 'Status', 'Expected Value', 'Owner', 'Converted Client ID', 'Created At'];
  const rows = leads.map((l) => [
    `#${l.id}`,
    `"${(l.title || `Lead #${l.id}`).replace(/"/g, '""')}"`,
    l.status,
    l.expectedValue != null ? l.expectedValue : '',
    `"${(l.owner?.fullName || l.owner?.email || l.ownerId || '').replace(/"/g, '""')}"`,
    l.convertedClientId ? `#CLI-${l.convertedClientId}` : '',
    l.createdAt ? new Date(l.createdAt).toLocaleDateString() : '',
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `leads_export_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default downloadAllLeadsCsv;

