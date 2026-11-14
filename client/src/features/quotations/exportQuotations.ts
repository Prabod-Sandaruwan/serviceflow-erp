import { api } from '../../lib/api';
import type { Quotation } from './types';

const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;

export async function downloadAllQuotationsCsv(fallback: Quotation[] = []) {
  let list = fallback;
  try {
    const res = await api.get<{ data: Quotation[] }>('/quotations?pageSize=100&page=1');
    if (res?.data && res.data.length > 0) list = [...res.data];
  } catch {
    // fallback
  }

  const headers = ['Quotation #', 'Title', 'Client', 'Total Amount', 'Status', 'Date', 'Valid Until', 'Expired'];
  const rows = list.map((q) => [
    escape(q.quotationNumber),
    escape(q.title),
    escape(q.clientName || q.clientId),
    escape(Number(q.total || 0).toFixed(2)),
    escape(q.status),
    escape(q.quotationDate || '-'),
    escape(q.validUntil || '-'),
    escape(q.isExpired ? 'Yes' : 'No'),
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL ? window.URL.createObjectURL(blob) : '';
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `quotations_export_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  if (window.URL?.revokeObjectURL) window.URL.revokeObjectURL(url);
}

export default downloadAllQuotationsCsv;

