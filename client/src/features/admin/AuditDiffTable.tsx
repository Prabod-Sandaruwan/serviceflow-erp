import { ArrowRight } from "lucide-react";
import { type DiffItem, formatValue } from "./auditDiffUtils";

interface AuditDiffTableProps {
  diffs: DiffItem[];
  isCreation: boolean;
}

export function AuditDiffTable({ diffs, isCreation }: AuditDiffTableProps) {
  if (isCreation) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
        {diffs.map((d) => (
          <div
            key={d.field}
            className="p-2.5 bg-white border border-slate-200 rounded-lg shadow-2xs"
          >
            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              {d.label}
            </div>
            <div className="mt-0.5 text-xs font-semibold text-slate-900 truncate">
              {formatValue(d.after)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase tracking-wider font-bold text-slate-500">
          <tr>
            <th className="py-2 px-3 w-1/4">Modified Field</th>
            <th className="py-2 px-3 w-1/3">Previous Value</th>
            <th className="py-2 px-1 text-center w-8"></th>
            <th className="py-2 px-3 w-1/3">New Value</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {diffs.map((d) => (
            <tr key={d.field} className="hover:bg-slate-50/50">
              <td className="py-2 px-3 font-medium text-slate-800">
                {d.label}
              </td>
              <td className="py-2 px-3">
                <span className="inline-block px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-mono text-[11px]">
                  {formatValue(d.before)}
                </span>
              </td>
              <td className="py-2 px-1 text-center text-slate-400">
                <ArrowRight className="w-3.5 h-3.5 mx-auto" />
              </td>
              <td className="py-2 px-3">
                <span className="inline-block px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono text-[11px] font-semibold">
                  {formatValue(d.after)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
