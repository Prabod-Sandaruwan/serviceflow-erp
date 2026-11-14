import React from 'react';

interface AuditLogRowProps {
  log: any;
  isExpanded: boolean;
  onToggle: () => void;
}

const actionStyles: Record<string, { bg: string; dot: string }> = {
  LOGIN: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80', dot: 'bg-emerald-500' },
  LOGOUT: { bg: 'bg-slate-100 text-slate-700 border-slate-200', dot: 'bg-slate-400' },
  USER_CREATED: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80', dot: 'bg-emerald-500' },
  CLIENT_CREATED: { bg: 'bg-blue-50 text-blue-700 border-blue-200/80', dot: 'bg-blue-500' },
  ROLE_CHANGED: { bg: 'bg-amber-50 text-amber-700 border-amber-200/80', dot: 'bg-amber-500' },
  PASSWORD_RESET: { bg: 'bg-rose-50 text-rose-700 border-rose-200/80', dot: 'bg-rose-500' },
};

export function AuditLogRow({ log, isExpanded, onToggle }: AuditLogRowProps) {
  const actor = log.actor?.email || log.actorRole || (log.actorUserId ? `User #${log.actorUserId}` : 'System');
  const roleInitial = (log.actorRole?.[0] || actor[0] || 'S').toUpperCase();
  const actorBg = roleInitial === 'A' ? 'bg-purple-100 text-purple-700' : roleInitial === 'M' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700';

  const actionStyle = actionStyles[log.action] || { bg: 'bg-blue-50 text-blue-700 border-blue-200/80', dot: 'bg-blue-500' };
  const dateStr = log.createdAt || log.date ? new Date(log.createdAt || log.date).toLocaleString() : '-';
  const metaText = log.ipAddress ? `IP: ${log.ipAddress}` : log.requestId ? `Req: ${log.requestId}` : log.action === 'LOGIN' ? 'Successful authentication' : 'Operation recorded';

  return (
    <React.Fragment>
      <tr className="hover:bg-blue-50/40 transition-colors border-b border-slate-100">
        <td className="py-3 px-4 text-center font-mono font-medium text-slate-500 text-xs">{log.id}</td>
        <td className="py-3 px-4 font-mono text-slate-700 whitespace-nowrap text-xs">{dateStr}</td>
        <td className="py-3 px-4">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center justify-center h-6 w-6 rounded-md font-bold text-[10px] ${actorBg}`}>{roleInitial}</span>
            <span className="font-semibold text-slate-800 tracking-tight text-xs">{actor}</span>
          </div>
        </td>
        <td className="py-3 px-4">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border ${actionStyle.bg}`}>
            <span className={`w-1.5 h-1.5 mr-1.5 rounded-full ${actionStyle.dot}`} />
            {log.action}
          </span>
        </td>
        <td className="py-3 px-4">
          <span className="font-mono font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 text-xs">
            {log.entityType}{log.entityId ? ` #${log.entityId}` : ''}
          </span>
        </td>
        <td className="py-3 px-4 text-slate-600 text-xs max-w-xs truncate">{metaText}</td>
        <td className="py-3 px-4 text-right">
          <button type="button" onClick={onToggle} className="px-3 py-1 bg-slate-700 hover:bg-slate-800 text-white rounded-lg font-medium text-[11px] shadow-xs transition-colors">
            Details
          </button>
        </td>
      </tr>
      {isExpanded && (
        <tr className="bg-slate-900/5">
          <td colSpan={7} className="p-4 border-b border-slate-200">
            <pre className="m-0 text-[11px] overflow-x-auto bg-slate-950 text-slate-100 p-4 rounded-xl font-mono shadow-inner">
              {JSON.stringify({ before: log.before ?? log.beforeJson, after: log.after ?? log.afterJson }, null, 2)}
            </pre>
          </td>
        </tr>
      )}
    </React.Fragment>
  );
}

export default AuditLogRow;
