import { api } from "../../lib/api";
import { downloadCsv } from "../../lib/csv";
import type { Client, ClientsResponse } from "./types";

export function exportClientsToCsv(clients: Client[]) {
  const list = clients || [];
  const headers = [
    "ID",
    "Name",
    "Type",
    "Email",
    "Phone",
    "Contact Person",
    "Status",
  ];
  const rows = list.map((c) => [
    `CLI-${c.id.slice(-4)}`,
    c.displayName || "",
    c.clientType || "",
    c.email || "",
    c.phone || "",
    c.contactPerson || "",
    c.isActive ? "Active" : "Inactive",
  ]);

  downloadCsv(
    `clients-directory-${new Date().toISOString().slice(0, 10)}.csv`,
    headers,
    rows,
  );
}

export async function downloadAllClientsCsv(fallbackClients: Client[] = []) {
  let list = fallbackClients;
  try {
    const res = await api.get<ClientsResponse>("/clients?limit=100&page=1");
    if (res?.data && res.data.length > 0) {
      list = [...res.data];
      const totalPages = res.meta?.totalPages || 1;
      for (let p = 2; p <= Math.min(totalPages, 10); p++) {
        const next = await api.get<ClientsResponse>(
          `/clients?limit=100&page=${p}`,
        );
        if (next?.data?.length) list.push(...next.data);
      }
    }
  } catch {
    // fallback
  }
  exportClientsToCsv(list);
}

export default downloadAllClientsCsv;
