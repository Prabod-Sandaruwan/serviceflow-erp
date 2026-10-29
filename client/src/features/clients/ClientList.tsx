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
    <span style={{ padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 500, background: isBiz ? '#ede9fe' : '#e0f2fe', color: isBiz ? '#6d28d9' : '#0369a1' }}>
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
      render: (c) => <Link to={`/clients/${c.id}`} style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}>View</Link>,
    },
  ];

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b' }}>Clients</h1>
        <Link to="/clients/new" style={{ textDecoration: 'none' }}><Button type="button">New client</Button></Link>
      </div>

      <div style={{ marginBottom: '1rem', maxWidth: '320px' }}>
        <Input id="client-search" placeholder="Search clients..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
      </div>

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
  );
}
