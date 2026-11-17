import { api } from "../../lib/api";
import { downloadCsv } from "../../lib/csv";

export async function downloadAllEmployeesCsv(fallbackEmployees: any[] = []) {
  let list = fallbackEmployees;
  try {
    const res = await api.get<{ data: any[]; meta: any }>(
      "/employees?pageSize=100&page=1",
    );
    if (res?.data && res.data.length > 0) {
      list = [...res.data];
      const totalPages = res.meta?.totalPages || 1;
      for (let p = 2; p <= Math.min(totalPages, 10); p++) {
        const next = await api.get<{ data: any[]; meta: any }>(
          `/employees?pageSize=100&page=${p}`,
        );
        if (next?.data?.length) list.push(...next.data);
      }
    }
  } catch {
    // fallback
  }

  const headers = [
    "Employee ID",
    "Full Name",
    "Email",
    "Job Title",
    "Phone",
    "Role",
    "Status",
    "Created At",
  ];
  const rows = list.map((e) => [
    e.id,
    e.fullName || e.full_name || "",
    e.email || "",
    e.jobTitle || e.job_title || "",
    e.phone || "",
    e.role || "STAFF",
    e.isActive !== false ? "Active" : "Inactive",
    e.createdAt ? new Date(e.createdAt).toLocaleDateString() : "",
  ]);

  downloadCsv(
    `employees_export_${new Date().toISOString().slice(0, 10)}.csv`,
    headers,
    rows,
  );
}

export default downloadAllEmployeesCsv;
