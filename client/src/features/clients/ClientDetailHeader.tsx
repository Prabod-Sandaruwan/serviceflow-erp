import type { Client } from "./types";
import { ClientStatusToggle } from "./ClientStatusToggle";

function getInitials(name?: string) {
  if (!name) return "CL";
  const p = name.trim().split(/\s+/);
  return (
    p.length >= 2 ? `${p[0][0]}${p[1][0]}` : name.slice(0, 2)
  ).toUpperCase();
}

function formatDate(ds?: string) {
  if (!ds) return "N/A";
  try {
    const d = new Date(ds);
    return isNaN(d.getTime())
      ? "N/A"
      : d.toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        });
  } catch {
    return "N/A";
  }
}

export function ClientDetailHeader({ client }: { client: Client }) {
  const code = client.registrationNumber?.startsWith("#CLI-")
    ? client.registrationNumber
    : `#CLI-${String(client.id).padStart(3, "0")}`;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl tracking-tight shadow-sm shrink-0">
          {getInitials(client.displayName)}
        </div>
        <div>
          <div className="flex items-center flex-wrap gap-2 mb-1">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {client.displayName}
            </h1>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold ${
                client.isActive
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-rose-50 text-rose-700 border border-rose-200"
              }`}
            >
              {client.isActive ? "Active" : "Inactive"}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
              {client.clientType === "INDIVIDUAL" ? "Individual" : "Company"}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200/80 font-mono">
              {code}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Client record created on {formatDate(client.createdAt)}
          </p>
        </div>
      </div>
      <ClientStatusToggle client={client} />
    </div>
  );
}

export default ClientDetailHeader;
