import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { useQuotations } from './hooks';
import { Table } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { Input, Button } from '../../components/ui/Forms';
import { QueryBoundary } from '../../components/states/QueryBoundary';
import { quotationColumns } from './columns';

export default function QuotationsPage() {
  const { user } = useAuth();
  const isStaff = user?.role === 'STAFF';
  const [searchParams, setSearchParams] = useSearchParams();

  const rawTab = searchParams.get('tab') || 'all';
  const activeTab = isStaff && rawTab === 'pending' ? 'all' : rawTab;
  const page = searchParams.get('page') || '1';
  const search = searchParams.get('search') || '';
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

  const queryParams: Record<string, any> = { page, search };
  if (activeTab === 'pending') queryParams.pendingApproval = true;
  else if (activeTab === 'mine') queryParams.createdBy = user?.id || 'me';

  const query = useQuotations(queryParams);

  const setTab = (t: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (t === 'all') next.delete('tab');
      else next.set('tab', t);
      next.set('page', '1');
      return next;
    });
  };

  const tabs = [
    { id: 'all', label: 'All' },
    ...(!isStaff ? [{ id: 'pending', label: 'Pending approval' }] : []),
    { id: 'mine', label: 'Mine' },
  ];

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, background: 'linear-gradient(135deg, #0f172a 0%, #4f46e5 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Quotations</h1>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>Manage quotations, pricing proposals, and client approvals</p>
        </div>
        <Link to="/quotations/new" style={{ textDecoration: 'none' }}>
          <Button type="button" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)', boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)', borderRadius: '8px', fontWeight: 600 }}>+ New Quotation</Button>
        </Link>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
        {tabs.map((t) => (
          <button key={t.id} type="button" role="tab" aria-selected={activeTab === t.id} onClick={() => setTab(t.id)}
            style={{ padding: '0.5rem 1rem', fontWeight: 600, fontSize: '0.875rem', color: activeTab === t.id ? '#4f46e5' : '#64748b', background: 'none', border: 'none', borderBottom: activeTab === t.id ? '2px solid #4f46e5' : '2px solid transparent', cursor: 'pointer' }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: '320px', marginBottom: '1.25rem' }}>
        <Input id="quotation-search" placeholder="Search quotations..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
      </div>

      <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.05)', padding: '1.25rem' }}>
        <QueryBoundary query={query} isEmpty={(d) => !d?.data || d.data.length === 0} emptyMessage="No quotations found">
          <Table columns={quotationColumns} data={query.data?.data} />
          <Pagination page={Number(page)} totalPages={query.data?.meta?.totalPages || 1} onPageChange={(p) => setSearchParams((prev) => { const next = new URLSearchParams(prev); next.set('page', String(p)); return next; })} />
        </QueryBoundary>
      </div>
    </div>
  );
}

export { QuotationsPage };
