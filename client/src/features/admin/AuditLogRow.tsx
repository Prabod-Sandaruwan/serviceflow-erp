import React from "react";
import { AuditLogDetails } from "./AuditLogDetails";
import {
  actionStyles,
  defaultActionStyle,
  getActorInfo,
  getMetaText,
} from "./auditRowStyles";

interface AuditLogRowProps {
  log: any;
  isExpanded: boolean;
  onToggle: () => void;
}

export function AuditLogRow({ log, isExpanded, onToggle }: AuditLogRowProps) {
  const { actor, roleInitial, actorBg } = getActorInfo(log);
  const actionStyle = actionStyles[log.action] || defaultActionStyle;
  const dateStr =
    log.createdAt || log.date
      ? new Date(log.createdAt || log.date).toLocaleString()
      : "-";

  return (
    <React.Fragment>
      <tr className="hover:bg-blue-50/40 transition-colors border-b border-slate-100">
        <td className="py-3 px-4 text-center font-mono font-medium text-slate-500 text-xs">
          {log.id}
        </td>
        <td className="py-3 px-4 font-mono text-slate-700 whitespace-nowrap text-xs">
          {dateStr}
        </td>
        <td className="py-3 px-4">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center justify-center h-6 w-6 rounded-md font-bold text-[10px] ${actorBg}`}
            >
              {roleInitial}
            </span>
            <span className="font-semibold text-slate-800 tracking-tight text-xs">
              {actor}
            </span>
          </div>
        </td>
        <td className="py-3 px-4">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border ${actionStyle.bg}`}
          >
            <span
              className={`w-1.5 h-1.5 mr-1.5 rounded-full ${actionStyle.dot}`}
            />
            {log.action}
          </span>
        </td>
        <td className="py-3 px-4">
          <span className="font-mono font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 text-xs">
            {log.entityType}
            {log.entityId ? ` #${log.entityId}` : ""}
          </span>
        </td>
        <td className="py-3 px-4 text-slate-600 text-xs max-w-xs truncate">
          {getMetaText(log)}
        </td>
        <td className="py-3 px-4 text-right">
          <button
            type="button"
            onClick={onToggle}
            className="px-3 py-1 bg-slate-700 hover:bg-slate-800 text-white rounded-lg font-medium text-[11px] shadow-xs transition-colors"
          >
            {isExpanded ? "Collapse" : "Details"}
          </button>
        </td>
      </tr>
      {isExpanded && (
        <tr className="bg-slate-50/50">
          <td colSpan={7} className="p-3 border-b border-slate-200">
            <AuditLogDetails log={log} />
          </td>
        </tr>
      )}
    </React.Fragment>
  );
}

export default AuditLogRow;
