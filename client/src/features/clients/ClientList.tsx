import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Upload, Plus } from 'lucide-react';
import { useClients } from './hooks';
import { Table } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { QueryBoundary } from '../../components/states/QueryBoundary';
import { ClientStats } from './ClientStats';
import { ClientFilterBar } from './ClientFilterBar';
import { getClientColumns } from './clientColumns';

export default function ClientList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = searchParams.get('page') || '1';
  const search = searchParams.get('search') || '';
  const typeFilter = searchParams.get('type') || '';
  const statusFilter = searchParams.get('status') || '';
  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    if (searchInput === search) return;
    const timer = setTimeout(() => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (searchInput.trim()) next.set('search', searchInput.trim());
        else next.delete('search');
        next.set('page', '1');
        return next;
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, search, setSearchParams]);

  const query = useClients({
    page, search, type: typeFilter || undefined,
    isActive: statusFilter || undefined, sort: '-createdAt',
  });

  const columns = getClientColumns();

  return (
    <div className="space-y-5 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Clients</h1>
          <p className="mt-1 text-xs text-slate-500">Client accounts, directory, and contact management</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button type="button" className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition">
            <Upload className="h-3.5 w-3.5 text-slate-400" /><span>Export</span>
          </button>
          <Link to="/clients/new">
            <button type="button" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs shadow-blue-200 transition">
              <Plus className="h-4 w-4" /><span>New client</span>
            </button>
          </Link>
        </div>
      </div>

      <ClientStats clients={query.data?.data} total={query.data?.meta?.total} />

      <ClientFilterBar
        search={searchInput} onSearchChange={setSearchInput} typeFilter={typeFilter}
        onTypeChange={(t) => setSearchParams((p) => { const n = new URLSearchParams(p); if (t) n.set('type', t); else n.delete('type'); n.set('page', '1'); return n; })}
        statusFilter={statusFilter}
        onStatusChange={(s) => setSearchParams((p) => { const n = new URLSearchParams(p); if (s) n.set('status', s); else n.delete('status'); n.set('page', '1'); return n; })}
        onRefresh={() => query.refetch()} activeCount={query.data?.data?.filter((c) => c.isActive).length}
      />

      <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
        <QueryBoundary query={query} isEmpty={(d) => !d?.data || d.data.length === 0} emptyMessage="No clients found">
          <Table columns={columns} data={query.data?.data} />
          <Pagination
            page={Number(page)} totalPages={query.data?.meta?.totalPages || 1}
            onPageChange={(p) => setSearchParams((prev) => { const next = new URLSearchParams(prev); next.set('page', String(p)); return next; })}
          />
        </QueryBoundary>
      </div>
    </div>
  );
}
