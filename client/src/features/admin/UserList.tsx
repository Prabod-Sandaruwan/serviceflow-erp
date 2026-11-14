import { useState } from 'react';
import { Download, Plus } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import { useUsers, useResetPassword } from './hooks';
import { Table } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button, Input } from '../../components/ui/Forms';
import { QueryBoundary } from '../../components/states/QueryBoundary';
import { useToast } from '../../components/ui/Toast';
import { UserModal } from './UserModal';
import { UserStats } from './UserStats';
import { downloadAllUsersCsv } from './exportUsers';

export default function UserList() {
  const { user: authUser } = useAuth();
  const { addToast } = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [isExporting, setIsExporting] = useState(false);

  const query = useUsers(page, search);
  const resetPassword = useResetPassword();

  const handleReset = async (user: any) => {
    const temp = window.prompt('Enter temporary password (min 12 characters):', 'TempPass@2026!');
    if (!temp) return;
    try {
      await resetPassword.mutateAsync({ id: user.id, tempPassword: temp });
      addToast(`Password reset for ${user.email}`, 'success');
    } catch { addToast('Failed to reset password', 'error'); }
  };

  const handleExport = async () => {
    setIsExporting(true);
    await downloadAllUsersCsv(data);
    setIsExporting(false);
  };

  const columns = [
    { key: 'email', label: 'Email', render: (r: any) => <span className="font-semibold text-slate-800">{r.email}</span> },
    { key: 'fullName', label: 'Full Name', render: (r: any) => r.fullName || r.employee?.fullName || '—' },
    { key: 'role', label: 'Role', render: (r: any) => <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">{r.role}</span> },
    { key: 'isActive', label: 'Status', render: (r: any) => <StatusBadge status={r.isActive !== false ? 'ACTIVE' : 'INACTIVE'} /> },
    {
      key: 'actions', label: 'Actions',
      render: (r: any) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="secondary" onClick={() => { setEditingUser(r); setModalOpen(true); }} style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}>Edit</Button>
          <Button variant="danger" onClick={() => handleReset(r)} style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}>Reset</Button>
        </div>
      ),
    },
  ];

  const data = (query.data as any)?.data || [];
  const meta = (query.data as any)?.meta;

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <span>Administration</span><span>&rsaquo;</span><span className="text-slate-600 font-medium">Access Control</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Users</h1>
          <p className="mt-0.5 text-xs text-slate-500">System accounts, access permissions, and role management</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button type="button" onClick={handleExport} disabled={isExporting} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-2xs transition cursor-pointer">
            <Download className="w-3.5 h-3.5" />{isExporting ? 'Exporting...' : 'Export CSV'}
          </button>
          <button type="button" onClick={() => { setEditingUser(null); setModalOpen(true); }} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-500/20 transition cursor-pointer">
            <Plus className="w-4 h-4" />Add User
          </button>
        </div>
      </div>
      <UserStats users={data} />
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5">
        <div className="max-w-xs mb-4">
          <Input id="user-search" placeholder="Search users..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <QueryBoundary query={query} emptyMessage="No users found.">
          <Table columns={columns} data={data} />
          {meta && <Pagination page={page} totalPages={meta.totalPages || 1} onPageChange={setPage} />}
        </QueryBoundary>
      </div>
      <UserModal isOpen={modalOpen} onClose={() => setModalOpen(false)} user={editingUser} isSelf={String(authUser?.id) === String(editingUser?.id)} />
    </div>
  );
}
