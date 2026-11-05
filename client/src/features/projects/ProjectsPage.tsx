import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProjects } from './hooks';
import { projectColumns } from './columns';
import { Table } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { Input, Select } from '../../components/ui/Forms';
import { QueryBoundary } from '../../components/states/QueryBoundary';

const STATUS_OPTS = [
  { value: '', label: 'All Statuses' },
  { value: 'PLANNED', label: 'Planned' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'ON_HOLD', label: 'On Hold' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export function ProjectsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = searchParams.get('page') || '1';
  const status = searchParams.get('status') || '';
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

  const query = useProjects({ page, status: status || undefined, search: search || undefined });

  const handleStatusChange = (val: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (val) next.set('status', val);
      else next.delete('status');
      next.set('page', '1');
      return next;
    });
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, display: 'inline-block', background: 'linear-gradient(90deg, #0f172a 0%, #2563eb 50%, #3b82f6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.025em' }}>Projects</h1>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>Track delivery, tasks, milestones, and progress</p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div style={{ maxWidth: '320px', flex: 1 }}>
          <Input id="project-search" placeholder="Search projects..." value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
        </div>
        <div style={{ width: '180px' }}>
          <Select id="status-filter" value={status} options={STATUS_OPTS} onChange={(e) => handleStatusChange(e.target.value)} />
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.05)', padding: '1.25rem' }}>
        <QueryBoundary query={query} isEmpty={(d) => !d?.data || d.data.length === 0} emptyMessage="No projects found">
          <Table columns={projectColumns} data={query.data?.data} />
          <Pagination
            page={Number(page)}
            totalPages={query.data?.meta?.totalPages || Math.ceil((query.data?.meta?.total || 0) / (query.data?.meta?.pageSize || 20)) || 1}
            onPageChange={(p) => setSearchParams((prev) => { const next = new URLSearchParams(prev); next.set('page', String(p)); return next; })}
          />
        </QueryBoundary>
      </div>
    </div>
  );
}

export default ProjectsPage;
