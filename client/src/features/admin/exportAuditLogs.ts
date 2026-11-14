const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;

export function exportAuditLogs(logs: any[], format: 'csv' | 'json' = 'csv') {
  const list = logs || [];
  if (format === 'json') {
    const blob = new Blob([JSON.stringify(list, null, 2)], { type: 'application/json' });
    const url = window.URL ? window.URL.createObjectURL(blob) : '';
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_logs_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    if (window.URL?.revokeObjectURL) window.URL.revokeObjectURL(url);
    return;
  }

  const headers = ['ID', 'Date & Time', 'Actor', 'Action', 'Entity Type', 'Entity ID', 'IP Address'];
  const rows = list.map((l) => [
    escape(l.id),
    escape(new Date(l.createdAt || l.date).toLocaleString()),
    escape(l.actor?.email || l.actorRole || l.actorUserId || 'System'),
    escape(l.action),
    escape(l.entityType),
    escape(l.entityId || ''),
    escape(l.ipAddress || ''),
  ]);

  const csv = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL ? window.URL.createObjectURL(blob) : '';
  const a = document.createElement('a');
  a.href = url;
  a.download = `audit_logs_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  if (window.URL?.revokeObjectURL) window.URL.revokeObjectURL(url);
}

export default exportAuditLogs;
