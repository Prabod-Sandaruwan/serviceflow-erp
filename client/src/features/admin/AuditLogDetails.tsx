import { useState } from "react";
import { Shield, Globe, Terminal, FileCode2, Info } from "lucide-react";
import { computeAuditDiff } from "./auditDiffUtils";
import { AuditDiffTable } from "./AuditDiffTable";

export function AuditLogDetails({ log }: { log: any }) {
  const [showRaw, setShowRaw] = useState(false);
  const before = log.before !== undefined ? log.before : log.beforeJson;
  const after = log.after !== undefined ? log.after : log.afterJson;

  const allDiffs = computeAuditDiff(before, after);
  const isCreation = !before && !!after;
  const diffs = isCreation
    ? allDiffs.filter((d) => d.type === "added" || d.type === "changed")
    : allDiffs.filter((d) => d.type !== "unchanged");

  const rawJson = JSON.stringify(
    { before: before ?? null, after: after ?? null },
    null,
    2,
  );

  return (
    <div className="p-4 bg-slate-50/70 border-t border-b border-slate-200 rounded-xl space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200/80 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-slate-200 font-medium text-slate-700 shadow-2xs">
            <Shield className="w-3 h-3 text-slate-500" />
            <span>Actor: {log.actor?.email || log.actorRole || "System"}</span>
          </span>
          {log.ipAddress && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-slate-200 font-mono text-slate-600 shadow-2xs">
              <Globe className="w-3 h-3 text-slate-400" />
              <span>IP: {log.ipAddress}</span>
            </span>
          )}
          {log.requestId && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-slate-200 font-mono text-slate-600 shadow-2xs">
              <Terminal className="w-3 h-3 text-slate-400" />
              <span>Req: {log.requestId.slice(0, 8)}…</span>
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowRaw((v) => !v)}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <FileCode2 className="w-3.5 h-3.5" />
          <span>{showRaw ? "Hide Raw JSON" : "Show Raw JSON"}</span>
        </button>
      </div>

      {diffs.length > 0 ? (
        <div className="space-y-1.5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
            {isCreation
              ? "Configured Entity Attributes"
              : "Recorded Field Modifications"}
          </div>
          <AuditDiffTable diffs={diffs} isCreation={isCreation} />
        </div>
      ) : (
        <div className="flex items-center gap-2 p-3 bg-white border border-slate-200 rounded-lg text-slate-600 text-xs shadow-2xs">
          <Info className="w-4 h-4 text-blue-500 shrink-0" />
          <span>
            No entity state modifications were associated with this security
            operation.
          </span>
        </div>
      )}

      {showRaw && (
        <pre className="text-[11px] overflow-x-auto bg-slate-950 text-slate-100 p-3 rounded-lg font-mono shadow-inner mt-2">
          {rawJson}
        </pre>
      )}
    </div>
  );
}
