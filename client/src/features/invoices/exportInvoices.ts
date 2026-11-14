import { api } from '../../lib/api';
import type { Invoice, InvoicesResponse } from './types';

const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;

export async function downloadAllInvoicesCsv(fallbackInvoices: Invoice[] = []) {
  let list = fallbackInvoices;
  try {
    const res = await api.get<InvoicesResponse>('/invoices?pageSize=100&page=1');
    if (res?.data && res.data.length > 0) {
      list = [...res.data];
      const totalPages = res.meta?.totalPages || 1;
      for (let p = 2; p <= Math.min(totalPages, 10); p++) {
        const next = await api.get<InvoicesResponse>(`/invoices?pageSize=100&page=${p}`);
        if (next?.data?.length) list.push(...next.data);
      }
    }
  } catch {
    // fallback
  }

  const headers = ['Invoice Number', 'Project', 'Client', 'Issue Date', 'Due Date', 'Total', 'Balance', 'Status', 'Is Overdue'];
  const rows = list.map((i) => [
    escape(i.invoiceNumber),
    escape(i.project?.name || (i.projectId ? `Project #${i.projectId}` : '')),
    escape(i.project?.client?.displayName || ''),
    escape(i.issueDate || '-'),
    escape(i.dueDate || '-'),
    escape(i.total),
    escape(i.balance),
    escape(i.status),
    escape(i.isOverdue ? 'Yes' : 'No'),
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL ? window.URL.createObjectURL(blob) : '';
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `invoices_export_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  if (window.URL?.revokeObjectURL) window.URL.revokeObjectURL(url);
}

export default downloadAllInvoicesCsv;

