import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Download } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { useQuotations } from './hooks';
import { Table } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { Input, Button } from '../../components/ui/Forms';
import { QueryBoundary } from '../../components/states/QueryBoundary';
import { quotationColumns } from './columns';
import { QuotationStats } from './QuotationStats';
import { QuotationTabs } from './QuotationTabs';
import { downloadAllQuotationsCsv } from './exportQuotations';

export default function QuotationsPage() {
  const { user } = useAuth();
  const isStaff = user?.role === 'STAFF';
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get('tab') || 'all';
  const activeTab = isStaff && rawTab === 'pending' ? 'all' : rawTab;
  const page = searchParams.get('page') || '1';
  const search = searchParams.get('search') || '';
  const [searchInput, setSearchInput] = useState(search);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (searchInput === search) return;
    const t = setTimeout(() => {
      setSearchParams((p) => {
        const n = new URLSearchParams(p);
        if (searchInput.trim()) n.set('search', searchInput.trim()); else n.delete('search');
        n.set('page', '1');
        return n;
      });
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput, search, setSearchParams]);

  const queryParams: Record<string, any> = { page, search };
  if (activeTab === 'pending') queryParams.pendingApproval = true;
  else if (activeTab === 'mine') queryParams.createdBy = user?.id || 'me';

  const query = useQuotations(queryParams);

  const setTab = (t: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (t === 'all') next.delete('tab'); else next.set('tab', t);
      next.set('page', '1');
      return next;
    });
  };

  const handleExport = async () => {
    setIsExporting(true);
    await downloadAllQuotationsCsv(query.data?.data || []);
    setIsExporting(false);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <span>CRM &amp; Pipeline</span><span>&rsaquo;</span><span className="text-slate-600 font-medium">Proposals</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Quotations</h1>
          <p className="mt-0.5 text-xs text-slate-500">Manage pricing proposals, client terms, and approval workflows</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button type="button" onClick={handleExport} disabled={isExporting} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-2xs transition cursor-pointer">
            <Download className="w-3.5 h-3.5" />{isExporting ? 'Exporting...' : 'Export CSV'}
          </button>
          <Link to="/quotations/new" className="text-decoration-none">
            <Button type="button" style={{ background: '#2563eb', padding: '0.45rem 0.9rem', fontSize: '0.8rem' }}>+ New Quotation</Button>
          </Link>
        </div>
      </div>
      <QuotationStats quotations={query.data?.data || []} />
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5">
        <QuotationTabs activeTab={activeTab} onTabChange={setTab} isStaff={isStaff} />
        <div className="max-w-xs mb-4">
          <Input id="quotation-search" placeholder="Search quotations..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
        </div>
        <QueryBoundary query={query} isEmpty={(d) => !d?.data || d.data.length === 0} emptyMessage="No quotations found">
          <Table columns={quotationColumns} data={query.data?.data} />
          <Pagination page={Number(page)} totalPages={query.data?.meta?.totalPages || 1} onPageChange={(p) => setSearchParams((prev) => { const n = new URLSearchParams(prev); n.set('page', String(p)); return n; })} />
        </QueryBoundary>
      </div>
    </div>
  );
}

export { QuotationsPage };
