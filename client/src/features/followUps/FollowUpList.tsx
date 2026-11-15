import { useState, useMemo } from 'react';
import { Download } from 'lucide-react';
import { useAllFollowUps, useMarkFollowUpDone } from './hooks';
import { FollowUpStats } from './FollowUpStats';
import { FollowUpFilterBar } from './FollowUpFilterBar';
import { FollowUpTable } from './FollowUpTable';
import { downloadAllFollowUpsCsv } from './exportFollowUps';
import { Pagination } from '../../components/ui/Pagination';
import { Spinner } from '../../components/ui/Spinner';
import { useToast } from '../../components/ui/Toast';

export default function FollowUpList() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [overdue, setOverdue] = useState(false);
  const [search, setSearch] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const { addToast } = useToast();

  const queryParams = useMemo(() => ({
    page, limit: 20,
    status: status || undefined,
    overdue: overdue || undefined,
  }), [page, status, overdue]);

  const { data: res, isLoading } = useAllFollowUps(queryParams);
  const markDoneMut = useMarkFollowUpDone();
  const allItems = res?.data || [];

  const filtered = useMemo(() => {
    if (!search.trim()) return allItems;
    const q = search.toLowerCase();
    return allItems.filter((f) =>
      (f.notes && f.notes.toLowerCase().includes(q)) ||
      (f.leadId && String(f.leadId).includes(q))
    );
  }, [allItems, search]);

  const handleMarkDone = async (id: string) => {
    try {
      await markDoneMut.mutateAsync(id);
      addToast('Follow-up marked as completed', 'success');
    } catch { addToast('Failed to mark follow-up as done', 'error'); }
  };

  const handleExport = async () => {
    setIsExporting(true);
    await downloadAllFollowUpsCsv(allItems);
    setIsExporting(false);
  };

  const totalPages = res?.meta?.totalPages || 1;

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <span>CRM &amp; Pipeline</span><span>&rsaquo;</span><span className="text-slate-600 font-medium">Follow-ups</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Follow-ups</h1>
          <p className="mt-0.5 text-xs text-slate-500">Track scheduled client calls, meetings, follow-ups, and engagement milestones</p>
        </div>
        <button type="button" onClick={handleExport} disabled={isExporting} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-2xs transition cursor-pointer">
          <Download className="w-3.5 h-3.5" />{isExporting ? 'Exporting...' : 'Export CSV'}
        </button>
      </div>

      <FollowUpStats followUps={allItems} />
      <FollowUpFilterBar
        search={search} onSearchChange={setSearch}
        status={status} onStatusChange={(v) => { setStatus(v); setPage(1); }}
        overdue={overdue} onOverdueChange={(v) => { setOverdue(v); setPage(1); }}
        onReset={() => { setStatus(''); setOverdue(false); setSearch(''); setPage(1); }}
      />

      {isLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white">
          <Spinner size="md" label="Loading follow-ups..." />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">No scheduled follow-ups found.</div>
      ) : (
        <>
          <FollowUpTable followUps={filtered} onMarkDone={handleMarkDone} isPendingDone={markDoneMut.isPending} />
          <div className="flex items-center justify-between px-2 text-xs text-slate-500 mt-2">
            <span>Showing <strong className="text-slate-700">{filtered.length}</strong> follow-ups</span>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </>
      )}
    </div>
  );
}
