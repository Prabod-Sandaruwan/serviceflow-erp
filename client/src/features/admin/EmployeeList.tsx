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
        <Button variant="secondary" onClick={() => { setEditingEmployee(r); setModalOpen(true); }} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
          Edit
        </Button>
      ),
    },
  ];

  const data = (query.data as any)?.data || [];
  const meta = (query.data as any)?.meta;

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>Employees</h1>
        <Button onClick={() => { setEditingEmployee(null); setModalOpen(true); }}>Add Employee</Button>
      </div>
      <div style={{ maxWidth: '300px', marginBottom: '1rem' }}>
        <Input id="emp-search" placeholder="Search employees..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
      </div>
      <QueryBoundary query={query} emptyMessage="No employees found.">
        <Table columns={columns} data={data} />
        {meta && <Pagination page={page} totalPages={meta.totalPages || 1} onPageChange={setPage} />}
      </QueryBoundary>
      <EmployeeModal isOpen={modalOpen} onClose={() => setModalOpen(false)} employee={editingEmployee} />
    </div>
  );
}
