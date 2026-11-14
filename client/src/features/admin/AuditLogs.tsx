import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { useAuditLogs } from './hooks';
import { QueryBoundary } from '../../components/states/QueryBoundary';
import { Pagination } from '../../components/ui/Pagination';
import { AuditFilterBar } from './AuditFilterBar';
import { AuditLogRow } from './AuditLogRow';
import { exportAuditLogs } from './exportAuditLogs';

export default function AuditLogs() {
  const [page, setPage] = useState(1);
  const [entityType, setEntityType] = useState('');
  const [action, setAction] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [expandedRow, setExpandedRow] = useState<string | number | null>(null);
  const [liveStream, setLiveStream] = useState(false);

  const query = useAuditLogs({ page, limit: 20, entityType, action, from, to });
  const data = (query.data as any)?.data || [];
  const meta = (query.data as any)?.meta;

  useEffect(() => {
    if (!liveStream) return;
    const interval = setInterval(() => query.refetch(), 10000);
    return () => clearInterval(interval);
  }, [liveStream, query]);

  const handleReset = () => { setFrom(''); setTo(''); setEntityType(''); setAction(''); setPage(1); };

  return (
    <div className="space-y-6 p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Audit Logs</h1>
          <p className="mt-1 text-xs text-slate-500">Immutable record of administrative, user, and financial operations</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setLiveStream((v) => !v)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-xs transition"
          >
            <span className={`w-2 h-2 rounded-full ${liveStream ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
            <span>Live Stream: {liveStream ? 'Active' : 'Auto-refresh'}</span>
          </button>
          <button
            type="button"
            onClick={() => exportAuditLogs(data)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs shadow-blue-200 transition"
          >
            <Download className="w-3.5 h-3.5" /><span>Export CSV / JSON</span>
          </button>
        </div>
      </div>

      <AuditFilterBar
        from={from} onFromChange={setFrom} to={to} onToChange={setTo}
        entityType={entityType} onEntityTypeChange={setEntityType}
        action={action} onActionChange={setAction} onFilter={() => setPage(1)} onReset={handleReset}
      />

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <QueryBoundary query={query} emptyMessage="No audit logs found.">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" id="audit-logs-table">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-16 text-center">ID</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Actor</th>
                  <th className="py-3.5 px-4">Action</th>
                  <th className="py-3.5 px-4">Entity</th>
                  <th className="py-3.5 px-4">Metadata & Details</th>
                  <th className="py-3.5 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {data.map((log: any) => (
                  <AuditLogRow
                    key={log.id} log={log} isExpanded={expandedRow === log.id}
                    onToggle={() => setExpandedRow(expandedRow === log.id ? null : log.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3.5 bg-slate-50/70 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <div>Showing <span className="font-semibold text-slate-900">{data.length}</span> of <span className="font-semibold text-slate-900">{meta?.total || data.length}</span> recorded audit operations</div>
            {meta && <Pagination page={page} totalPages={meta.totalPages || 1} onPageChange={setPage} />}
          </div>
        </QueryBoundary>
      </div>
    </div>
  );
}
