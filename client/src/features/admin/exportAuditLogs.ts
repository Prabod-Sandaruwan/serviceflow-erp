import { downloadCsv } from "../../lib/csv";

export function exportAuditLogs(logs: any[], format: "csv" | "json" = "csv") {
  const list = logs || [];
  if (format === "json") {
    const blob = new Blob([JSON.stringify(list, null, 2)], {
      type: "application/json",
    });
    const url = window.URL ? window.URL.createObjectURL(blob) : "";
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit_logs_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    if (window.URL?.revokeObjectURL) window.URL.revokeObjectURL(url);
    return;
  }

  const headers = [
    "ID",
    "Date & Time",
    "Actor",
    "Action",
    "Entity Type",
    "Entity ID",
    "IP Address",
  ];
  const rows = list.map((l) => [
    l.id,
    new Date(l.createdAt || l.date).toLocaleString(),
    l.actor?.email || l.actorRole || l.actorUserId || "System",
    l.action,
    l.entityType,
    l.entityId || "",
    l.ipAddress || "",
  ]);

  downloadCsv(
    `audit_logs_${new Date().toISOString().slice(0, 10)}.csv`,
    headers,
    rows,
  );
}

export default exportAuditLogs;
