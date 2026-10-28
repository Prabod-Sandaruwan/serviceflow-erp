import { useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { useUsers, useResetPassword } from './hooks';
import { Table } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button, Input } from '../../components/ui/Forms';
import { QueryBoundary } from '../../components/states/QueryBoundary';
import { useToast } from '../../components/ui/Toast';
import { UserModal } from './UserModal';

export default function UserList() {
  const { user: authUser } = useAuth();
  const { addToast } = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  const query = useUsers(page, search);
  const resetPassword = useResetPassword();

  const handleReset = async (user: any) => {
    const temp = window.prompt('Enter temporary password (min 12 characters):', 'TempPass@2026!');
    if (!temp) return;
    try {
      await resetPassword.mutateAsync({ id: user.id, tempPassword: temp });
      addToast(`Password reset for ${user.email}`, 'success');
    } catch {
      addToast('Failed to reset password', 'error');
    }
  };

  const columns = [
    { key: 'email', label: 'Email' },
    { key: 'fullName', label: 'Full Name', render: (r: any) => r.fullName || r.employee?.fullName || '-' },
    { key: 'role', label: 'Role' },
    { key: 'isActive', label: 'Status', render: (r: any) => <StatusBadge status={r.isActive !== false ? 'ACTIVE' : 'INACTIVE'} /> },
    {
      key: 'actions',
      label: 'Actions',
      render: (r: any) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="secondary" onClick={() => { setEditingUser(r); setModalOpen(true); }} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
            Edit
          </Button>
          <Button variant="danger" onClick={() => handleReset(r)} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
            Reset
          </Button>
        </div>
      ),
    },
  ];

  const data = (query.data as any)?.data || [];
  const meta = (query.data as any)?.meta;

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>Users</h1>
        <Button onClick={() => { setEditingUser(null); setModalOpen(true); }}>Add User</Button>
      </div>
      <div style={{ maxWidth: '300px', marginBottom: '1rem' }}>
        <Input id="user-search" placeholder="Search users..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
      </div>
      <QueryBoundary query={query} emptyMessage="No users found.">
        <Table columns={columns} data={data} />
        {meta && <Pagination page={page} totalPages={meta.totalPages || 1} onPageChange={setPage} />}
      </QueryBoundary>
      <UserModal isOpen={modalOpen} onClose={() => setModalOpen(false)} user={editingUser} isSelf={String(authUser?.id) === String(editingUser?.id)} />
    </div>
  );
}
