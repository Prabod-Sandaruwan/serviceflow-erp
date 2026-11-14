import { api } from '../../lib/api';

const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;

export async function downloadAllEmployeesCsv(fallbackEmployees: any[] = []) {
  let list = fallbackEmployees;
  try {
    const res = await api.get<{ data: any[]; meta: any }>('/employees?pageSize=100&page=1');
    if (res?.data && res.data.length > 0) {
      list = [...res.data];
      const totalPages = res.meta?.totalPages || 1;
      for (let p = 2; p <= Math.min(totalPages, 10); p++) {
        const next = await api.get<{ data: any[]; meta: any }>(`/employees?pageSize=100&page=${p}`);
        if (next?.data?.length) list.push(...next.data);
      }
    }
  } catch {
    // fallback
  }

  const headers = ['Employee ID', 'Full Name', 'Email', 'Job Title', 'Phone', 'Role', 'Status', 'Created At'];
  const rows = list.map((e) => [
    escape(e.id),
    escape(e.fullName || e.full_name || ''),
    escape(e.email || ''),
    escape(e.jobTitle || e.job_title || ''),
    escape(e.phone || ''),
    escape(e.role || 'STAFF'),
    escape(e.isActive !== false ? 'Active' : 'Inactive'),
    escape(e.createdAt ? new Date(e.createdAt).toLocaleDateString() : ''),
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL ? window.URL.createObjectURL(blob) : '';
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `employees_export_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  if (window.URL?.revokeObjectURL) window.URL.revokeObjectURL(url);
}

export default downloadAllEmployeesCsv;

