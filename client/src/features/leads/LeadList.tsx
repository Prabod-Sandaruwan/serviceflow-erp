import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { useLeads } from './hooks';
import { Table, type Column } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Select, Input, Button } from '../../components/ui/Forms';
import { QueryBoundary } from '../../components/states/QueryBoundary';
import type { Lead } from './types';

export default function LeadList() {
  const { user } = useAuth();
  const isStaff = user?.role === 'STAFF';
  const [searchParams, setSearchParams] = useSearchParams();
  const page = searchParams.get('page') || '1';
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
  const ownerId = searchParams.get('ownerId') || '';
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

  const query = useLeads({ page, search, status, ownerId: isStaff ? undefined : ownerId });

  const updateParam = (key: string, val: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (val) next.set(key, val);
      else next.delete(key);
      next.set('page', '1');
      return next;
    });
  };

  const columns: Column<Lead>[] = [
    { key: 'title', label: 'Title', render: (l) => l.title || `Lead #${l.id}` },
    {
      key: 'client', label: 'Client / Owner',
      render: (l) => l.convertedClientId ? `Client #${l.convertedClientId}` : (l.owner?.fullName || l.owner?.email || `User #${l.ownerId}`),
    },
    { key: 'expectedValue', label: 'Value', render: (l) => l.expectedValue != null ? `$${l.expectedValue.toLocaleString()}` : '-' },
    { key: 'status', label: 'Status', render: (l) => <StatusBadge status={l.status} /> },
    {
      key: 'actions', label: 'Actions',
      render: (l) => (
        <Link to={`/leads/${l.id}`} style={{ color: '#4f46e5', textDecoration: 'none', fontWeight: 600, padding: '0.25rem 0.65rem', background: 'rgba(99, 102, 241, 0.08)', borderRadius: '6px', border: '1px solid rgba(99, 102, 241, 0.25)', fontSize: '0.8rem' }}>
          View
        </Link>
      ),
    },
  ];

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, background: 'linear-gradient(135deg, #0f172a 0%, #4f46e5 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.025em' }}>Leads</h1>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>Track prospective sales opportunities and conversion pipelines</p>
        </div>
        <Link to="/leads/new" style={{ textDecoration: 'none' }}>
          <Button type="button" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)', boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)', borderRadius: '8px', fontWeight: 600 }}>+ New Lead</Button>
        </Link>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ minWidth: '220px' }}>
          <Input id="lead-search" placeholder="Search leads..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
        </div>
        <div style={{ minWidth: '180px' }}>
          <Select id="lead-status" options={[{ value: '', label: 'All Statuses' }, { value: 'NEW', label: 'New' }, { value: 'CONTACTED', label: 'Contacted' }, { value: 'QUALIFIED', label: 'Qualified' }, { value: 'PROPOSAL_SENT', label: 'Proposal Sent' }, { value: 'CONVERTED', label: 'Converted' }, { value: 'LOST', label: 'Lost' }]} value={status} onChange={(e) => updateParam('status', e.target.value)} />
        </div>
        {!isStaff && (
          <div style={{ minWidth: '160px' }}>
            <Input id="lead-owner" placeholder="Filter by Owner ID..." value={ownerId} onChange={(e) => updateParam('ownerId', e.target.value)} />
          </div>
        )}
      </div>

      <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.05)', padding: '1.25rem' }}>
        <QueryBoundary query={query} isEmpty={(d) => !d?.data || d.data.length === 0} emptyMessage="No leads found">
          <Table columns={columns} data={query.data?.data} />
          <Pagination page={Number(page)} totalPages={query.data?.meta?.totalPages || 1} onPageChange={(p) => updateParam('page', String(p))} />
        </QueryBoundary>
      </div>
    </div>
  );
}
