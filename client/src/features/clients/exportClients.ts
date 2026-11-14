import { api } from '../../lib/api';
import type { Client, ClientsResponse } from './types';

const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;

export function exportClientsToCsv(clients: Client[]) {
  const list = clients || [];
  const headers = ['ID', 'Name', 'Type', 'Email', 'Phone', 'Contact Person', 'Status'];
  const rows = list.map((c) => [
    escape(`CLI-${c.id.slice(-4)}`),
    escape(c.displayName || ''),
    escape(c.clientType || ''),
    escape(c.email || ''),
    escape(c.phone || ''),
    escape(c.contactPerson || ''),
    escape(c.isActive ? 'Active' : 'Inactive'),
  ]);
  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL ? window.URL.createObjectURL(blob) : '';
  const a = document.createElement('a');
  a.href = url;
  a.download = `clients-directory-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  if (window.URL?.revokeObjectURL) window.URL.revokeObjectURL(url);
}

export async function downloadAllClientsCsv(fallbackClients: Client[] = []) {
  let list = fallbackClients;
  try {
    const res = await api.get<ClientsResponse>('/clients?limit=100&page=1');
    if (res?.data && res.data.length > 0) {
      list = [...res.data];
      const totalPages = res.meta?.totalPages || 1;
      for (let p = 2; p <= Math.min(totalPages, 10); p++) {
        const next = await api.get<ClientsResponse>(`/clients?limit=100&page=${p}`);
        if (next?.data?.length) list.push(...next.data);
      }
    }
  } catch {
    // fallback
  }
  exportClientsToCsv(list);
}

export default downloadAllClientsCsv;
