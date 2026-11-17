import { api } from "../../lib/api";
import { downloadCsv } from "../../lib/csv";
import type { Project, ProjectsResponse } from "./types";

export async function downloadAllProjectsCsv(fallback: Project[] = []) {
  let list = fallback;
  try {
    const res = await api.get<ProjectsResponse>(
      "/projects?pageSize=100&page=1",
    );
    if (res?.data && res.data.length > 0) {
      list = [...res.data];
    }
  } catch {
    // fallback
  }

  const headers = [
    "Project Code",
    "Name",
    "Client",
    "Status",
    "Progress",
    "Budget Amount",
    "Start Date",
    "End Date",
  ];
  const rows = list.map((p) => [
    p.projectCode,
    p.name,
    p.client?.displayName || "-",
    p.status,
    `${p.progressPercent || 0}%`,
    p.budgetAmount || "-",
    p.startDate || "-",
    p.endDate || "-",
  ]);

  downloadCsv(
    `projects_export_${new Date().toISOString().slice(0, 10)}.csv`,
    headers,
    rows,
  );
}

export default downloadAllProjectsCsv;
