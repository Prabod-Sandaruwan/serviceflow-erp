import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Download, Plus } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { useLeads } from './hooks';
import { Table } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { QueryBoundary } from '../../components/states/QueryBoundary';
import { LeadStats } from './LeadStats';
import { LeadFilterBar } from './LeadFilterBar';
import { getLeadColumns } from './leadColumns';
import { LeadKanbanBoard } from './LeadKanbanBoard';
import { downloadAllLeadsCsv } from './exportLeads';

export default function LeadList() {
  const { user } = useAuth();
  const isStaff = user?.role === 'STAFF';
  const [searchParams, setSearchParams] = useSearchParams();
  const page = searchParams.get('page') || '1';
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
  const ownerId = searchParams.get('ownerId') || '';
  const [searchInput, setSearchInput] = useState(search);
  const [viewMode, setViewMode] = useState<'table' | 'board'>('table');

  useEffect(() => {
    if (searchInput === search) return;
    const t = setTimeout(() => {
      setSearchParams((p) => {
        const n = new URLSearchParams(p);
        if (searchInput.trim()) n.set('search', searchInput.trim()); else n.delete('search');
        n.set('page', '1'); return n;
      });
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput, search, setSearchParams]);

  const query = useLeads({ page, search, status, ownerId: isStaff ? undefined : ownerId });

  const updateParam = (k: string, v: string) => setSearchParams((p) => {
    const n = new URLSearchParams(p);
    if (v) n.set(k, v); else n.delete(k);
    n.set('page', '1'); return n;
  });

  const columns = getLeadColumns();
  const total = query.data?.meta?.total || 0;
  const list = query.data?.data || [];

  return (
    <div className="space-y-5 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Leads</h1>
          <p className="mt-1 text-xs text-slate-500">Track prospective sales opportunities and conversion pipelines</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button type="button" onClick={() => downloadAllLeadsCsv(list)} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition">
            <Download className="h-3.5 w-3.5 text-slate-400" /><span>Export Leads</span>
          </button>
          <Link to="/leads/new">
            <button type="button" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs shadow-blue-200 transition">
              <Plus className="h-4 w-4" /><span>+ New Lead</span>
            </button>
          </Link>
        </div>
      </div>

      <LeadStats leads={list} />

      <LeadFilterBar
        search={searchInput} onSearchChange={setSearchInput} status={status}
        onStatusChange={(s) => updateParam('status', s)} ownerId={ownerId}
        onOwnerIdChange={(o) => updateParam('ownerId', o)} isStaff={isStaff}
        onRefresh={() => query.refetch()} viewMode={viewMode} onViewModeChange={setViewMode}
      />

      <div className="space-y-4">
        <QueryBoundary query={query} isEmpty={(d) => !d?.data || d.data.length === 0} emptyMessage="No leads found">
          {viewMode === 'table' ? (
            <div className="space-y-4">
              <Table columns={columns} data={list} />
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 pt-1">
                <span>Showing {list.length} of {total} total leads</span>
                <Pagination page={Number(page)} totalPages={query.data?.meta?.totalPages || 1} onPageChange={(p) => updateParam('page', String(p))} />
              </div>
            </div>
          ) : (
            <LeadKanbanBoard leads={list} />
          )}
        </QueryBoundary>
      </div>
    </div>
  );
}
