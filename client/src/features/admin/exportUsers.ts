import { api } from "../../lib/api";
import { downloadCsv } from "../../lib/csv";

export async function downloadAllUsersCsv(fallback: any[] = []) {
  let list = fallback;
  try {
    const res = await api.get<{ data: any[] }>("/admin/users?limit=100&page=1");
    if (res?.data && res.data.length > 0) list = [...res.data];
  } catch {
    // fallback
  }

  const headers = ["User ID", "Email", "Full Name", "Role", "Status"];
  const rows = list.map((u) => [
    u.id,
    u.email,
    u.fullName || u.employee?.fullName || "-",
    u.role,
    u.isActive !== false ? "Active" : "Inactive",
  ]);

  downloadCsv(
    `users_export_${new Date().toISOString().slice(0, 10)}.csv`,
    headers,
    rows,
  );
}

export default downloadAllUsersCsv;
