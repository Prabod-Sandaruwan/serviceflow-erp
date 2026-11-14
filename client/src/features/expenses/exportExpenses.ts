import { api } from '../../lib/api';
import type { Expense, ExpensesResponse } from './types';

const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;

export async function downloadAllExpensesCsv(fallbackExpenses: Expense[] = []) {
  let list = fallbackExpenses;
  try {
    const res = await api.get<ExpensesResponse>('/expenses');
    if (res?.data && res.data.length > 0) {
      list = [...res.data];
    }
  } catch {
    // use fallback
  }

  const headers = ['Expense ID', 'Date', 'Project ID', 'Category', 'Description', 'Supplier', 'Amount', 'Status'];
  const rows = list.map((e) => [
    escape(e.id),
    escape(e.expenseDate || e.expense_date || ''),
    escape(e.projectId || e.project_id || ''),
    escape(e.category),
    escape(e.description),
    escape(e.supplier || '-'),
    escape(Number(e.amount).toFixed(2)),
    escape(e.status),
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL ? window.URL.createObjectURL(blob) : '';
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `expenses_export_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  if (window.URL?.revokeObjectURL) window.URL.revokeObjectURL(url);
}

export default downloadAllExpensesCsv;
