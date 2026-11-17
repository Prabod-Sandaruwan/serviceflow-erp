import { api } from "../../lib/api";
import { downloadCsv } from "../../lib/csv";
import type { Lead, LeadsResponse } from "./types";

export async function downloadAllLeadsCsv(fallbackLeads: Lead[] = []) {
  let leads = fallbackLeads;
  try {
    const res = await api.get<LeadsResponse>("/leads?limit=100&page=1");
    if (res?.data && res.data.length > 0) {
      leads = [...res.data];
      const totalPages = res.meta?.totalPages || 1;
      for (let p = 2; p <= Math.min(totalPages, 10); p++) {
        const next = await api.get<LeadsResponse>(`/leads?limit=100&page=${p}`);
        if (next?.data?.length) leads.push(...next.data);
      }
    }
  } catch {
    // fallback to currently displayed leads
  }

  const headers = [
    "Lead ID",
    "Title",
    "Status",
    "Expected Value",
    "Owner",
    "Converted Client ID",
    "Created At",
  ];
  const rows = leads.map((l) => [
    l.id,
    l.title || `Lead #${l.id}`,
    l.status,
    l.expectedValue != null ? l.expectedValue : "",
    l.owner?.fullName || l.owner?.email || l.ownerId || "",
    l.convertedClientId ? `CLI-${l.convertedClientId}` : "",
    l.createdAt ? new Date(l.createdAt).toLocaleDateString() : "",
  ]);

  downloadCsv(
    `leads_export_${new Date().toISOString().slice(0, 10)}.csv`,
    headers,
    rows,
  );
}

export default downloadAllLeadsCsv;
