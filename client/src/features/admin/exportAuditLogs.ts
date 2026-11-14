export function exportAuditLogs(logs: any[], format: 'csv' | 'json' = 'csv') {
  if (!logs || logs.length === 0) return;

  if (format === 'json') {
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_logs_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    return;
  }

  const headers = ['ID', 'Date & Time', 'Actor', 'Action', 'Entity Type', 'Entity ID', 'IP Address'];
  const rows = logs.map((l) => [
    l.id,
    `"${new Date(l.createdAt || l.date).toLocaleString().replace(/"/g, '""')}"`,
    `"${(l.actor?.email || l.actorRole || l.actorUserId || 'System').replace(/"/g, '""')}"`,
    l.action,
    l.entityType,
    l.entityId || '',
    l.ipAddress || '',
  ]);

  const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const a = document.createElement('a');
  a.href = encodeURI(csv);
  a.download = `audit_logs_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export default exportAuditLogs;
