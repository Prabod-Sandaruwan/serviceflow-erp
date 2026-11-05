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
          <Button variant="secondary" onClick={() => { setEditingUser(r); setModalOpen(true); }} style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem', background: 'rgba(99, 102, 241, 0.08)', color: '#4f46e5', border: '1px solid rgba(99, 102, 241, 0.25)', borderRadius: '6px', fontWeight: 600 }}>
            Edit
          </Button>
          <Button variant="danger" onClick={() => handleReset(r)} style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', color: '#dc2626', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '6px', fontWeight: 600 }}>
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, display: 'inline-block', background: 'linear-gradient(90deg, #0f172a 0%, #2563eb 50%, #3b82f6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.025em' }}>Users</h1>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>System accounts, access permissions, and role management</p>
        </div>
        <Button onClick={() => { setEditingUser(null); setModalOpen(true); }} style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)', boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)', borderRadius: '8px', fontWeight: 600 }}>Add User</Button>
      </div>
      <div style={{ maxWidth: '320px', marginBottom: '1.25rem' }}>
        <Input id="user-search" placeholder="Search users..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
      </div>
      <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.05)', padding: '1.25rem' }}>
        <QueryBoundary query={query} emptyMessage="No users found.">
          <Table columns={columns} data={data} />
          {meta && <Pagination page={page} totalPages={meta.totalPages || 1} onPageChange={setPage} />}
        </QueryBoundary>
      </div>
      <UserModal isOpen={modalOpen} onClose={() => setModalOpen(false)} user={editingUser} isSelf={String(authUser?.id) === String(editingUser?.id)} />
    </div>
  );
}
