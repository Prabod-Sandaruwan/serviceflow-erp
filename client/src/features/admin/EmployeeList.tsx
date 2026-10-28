import { useState } from 'react';
import { useEmployees } from './hooks';
import { Table } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button, Input } from '../../components/ui/Forms';
import { QueryBoundary } from '../../components/states/QueryBoundary';
import { EmployeeModal } from './EmployeeModal';

export default function EmployeeList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);

  const query = useEmployees(page, search);

  const columns = [
    { key: 'fullName', label: 'Full Name' },
    { key: 'email', label: 'Email' },
    { key: 'jobTitle', label: 'Job Title' },
    { key: 'isActive', label: 'Status', render: (r: any) => <StatusBadge status={r.isActive !== false ? 'ACTIVE' : 'INACTIVE'} /> },
    {
      key: 'actions',
      label: 'Actions',
      render: (r: any) => (
        <Button variant="secondary" onClick={() => { setEditingEmployee(r); setModalOpen(true); }} style={{ padding: '0.3rem 0.75rem', fontSize: '0.775rem', background: 'rgba(99, 102, 241, 0.08)', color: '#4f46e5', border: '1px solid rgba(99, 102, 241, 0.25)', borderRadius: '6px', fontWeight: 600 }}>
          Edit
        </Button>
      ),
    },
  ];

  const data = (query.data as any)?.data || [];
  const meta = (query.data as any)?.meta;

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, background: 'linear-gradient(135deg, #0f172a 0%, #4f46e5 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.025em' }}>Employees</h1>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>Staff directory, contact information, and role assignments</p>
        </div>
        <Button onClick={() => { setEditingEmployee(null); setModalOpen(true); }} style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)', boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)', borderRadius: '8px', fontWeight: 600 }}>Add Employee</Button>
      </div>
      <div style={{ maxWidth: '320px', marginBottom: '1.25rem' }}>
        <Input id="emp-search" placeholder="Search employees..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
      </div>
      <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.05)', padding: '1.25rem' }}>
        <QueryBoundary query={query} emptyMessage="No employees found.">
          <Table columns={columns} data={data} />
          {meta && <Pagination page={page} totalPages={meta.totalPages || 1} onPageChange={setPage} />}
        </QueryBoundary>
      </div>
      <EmployeeModal isOpen={modalOpen} onClose={() => setModalOpen(false)} employee={editingEmployee} />
    </div>
  );
}
