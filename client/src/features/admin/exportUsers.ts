import { api } from '../../lib/api';

const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;

export async function downloadAllUsersCsv(fallback: any[] = []) {
  let list = fallback;
  try {
    const res = await api.get<{ data: any[] }>('/admin/users?limit=100&page=1');
    if (res?.data && res.data.length > 0) list = [...res.data];
  } catch {
    // fallback
  }

  const headers = ['User ID', 'Email', 'Full Name', 'Role', 'Status'];
  const rows = list.map((u) => [
    escape(u.id),
    escape(u.email),
    escape(u.fullName || u.employee?.fullName || '-'),
    escape(u.role),
    escape(u.isActive !== false ? 'Active' : 'Inactive'),
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL ? window.URL.createObjectURL(blob) : '';
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `users_export_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  if (window.URL?.revokeObjectURL) window.URL.revokeObjectURL(url);
}

export default downloadAllUsersCsv;
