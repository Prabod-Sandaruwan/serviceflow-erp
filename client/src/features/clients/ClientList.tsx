import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useClients } from './hooks';
import { Table, type Column } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Input, Button } from '../../components/ui/Forms';
import { QueryBoundary } from '../../components/states/QueryBoundary';
import type { Client } from './types';

const typeBadge = (t: string) => {
  const isBiz = t === 'BUSINESS' || t === 'COMPANY';
  return (
    <span style={{ padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, background: isBiz ? '#ede9fe' : '#e0f2fe', color: isBiz ? '#6d28d9' : '#0369a1' }}>
      {t}
    </span>
  );
};

export default function ClientList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = searchParams.get('page') || '1';
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || '-createdAt';
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

  const query = useClients({ page, search, sort });

  const columns: Column<Client>[] = [
    { key: 'displayName', label: 'Name' },
    { key: 'clientType', label: 'Type', render: (c) => typeBadge(c.clientType) },
    { key: 'email', label: 'Email', render: (c) => c.email || '-' },
    { key: 'phone', label: 'Phone', render: (c) => c.phone || '-' },
    { key: 'isActive', label: 'Status', render: (c) => <StatusBadge status={c.isActive ? 'ACTIVE' : 'INACTIVE'} /> },
    {
      key: 'actions', label: 'Actions',
      render: (c) => (
        <Link to={`/clients/${c.id}`} style={{ color: '#4f46e5', textDecoration: 'none', fontWeight: 600, padding: '0.25rem 0.65rem', background: 'rgba(99, 102, 241, 0.08)', borderRadius: '6px', border: '1px solid rgba(99, 102, 241, 0.25)', fontSize: '0.8rem' }}>
          View
        </Link>
      ),
    },
  ];

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, background: 'linear-gradient(135deg, #0f172a 0%, #4f46e5 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.025em' }}>Clients</h1>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>Client accounts, directory, and contact management</p>
        </div>
        <Link to="/clients/new" style={{ textDecoration: 'none' }}>
          <Button type="button" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)', boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)', borderRadius: '8px', fontWeight: 600 }}>New client</Button>
        </Link>
      </div>
      <div style={{ maxWidth: '320px', marginBottom: '1.25rem' }}>
        <Input id="client-search" placeholder="Search clients..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
      </div>
      <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.05)', padding: '1.25rem' }}>
        <QueryBoundary query={query} isEmpty={(d) => !d?.data || d.data.length === 0} emptyMessage="No clients found">
          <Table columns={columns} data={query.data?.data} />
          <Pagination
            page={Number(page)}
            totalPages={query.data?.meta?.totalPages || 1}
            onPageChange={(p) => setSearchParams((prev) => {
              const next = new URLSearchParams(prev);
              next.set('page', String(p));
              return next;
            })}
          />
        </QueryBoundary>
      </div>
    </div>
  );
}
