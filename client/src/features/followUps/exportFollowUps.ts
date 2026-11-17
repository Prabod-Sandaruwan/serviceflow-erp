import { api } from "../../lib/api";
import { downloadCsv } from "../../lib/csv";
import type { FollowUp } from "../leads/types";
import type { FollowUpsListResponse } from "./hooks";

export async function downloadAllFollowUpsCsv(fallback: FollowUp[] = []) {
  let list = fallback;
  try {
    const res = await api.get<FollowUpsListResponse>(
      "/follow-ups?limit=100&page=1",
    );
    if (res?.data && res.data.length > 0) list = [...res.data];
  } catch {
    // fallback
  }

  const headers = [
    "Follow-up ID",
    "Lead ID",
    "Scheduled At",
    "Status",
    "Is Overdue",
    "Notes",
  ];
  const rows = list.map((f) => [
    f.id,
    f.leadId,
    f.scheduledAt ? new Date(f.scheduledAt).toLocaleString() : "-",
    f.status,
    f.isOverdue ? "Yes" : "No",
    f.notes || "-",
  ]);

  downloadCsv(
    `followups_export_${new Date().toISOString().slice(0, 10)}.csv`,
    headers,
    rows,
  );
}

export default downloadAllFollowUpsCsv;
