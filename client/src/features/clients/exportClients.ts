import { api } from '../../lib/api';
import type { Client, ClientsResponse } from './types';

export function exportClientsToCsv(clients: Client[]) {
  if (!clients || clients.length === 0) return;
  const headers = ['ID', 'Name', 'Type', 'Email', 'Phone', 'Contact Person', 'Status'];
  const rows = clients.map((c) => [
    `"#CLI-${c.id.slice(-4)}"`,
    `"${(c.displayName || '').replace(/"/g, '""')}"`,
    `"${c.clientType}"`,
    `"${(c.email || '').replace(/"/g, '""')}"`,
    `"${(c.phone || '').replace(/"/g, '""')}"`,
    `"${(c.contactPerson || '').replace(/"/g, '""')}"`,
    `"${c.isActive ? 'Active' : 'Inactive'}"`,
  ]);
  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `clients-directory-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function downloadAllClientsCsv(fallbackClients: Client[] = []) {
  try {
    const res = await api.get<ClientsResponse>('/clients?limit=1000');
    const list = res?.data?.length ? res.data : fallbackClients;
    exportClientsToCsv(list);
  } catch {
    exportClientsToCsv(fallbackClients);
  }
}

export default downloadAllClientsCsv;

