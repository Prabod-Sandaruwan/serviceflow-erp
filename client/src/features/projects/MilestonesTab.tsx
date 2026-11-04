import { useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { useToast } from '../../components/ui/Toast';
import { Table, type Column } from '../../components/ui/Table';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Forms';
import { Modal } from '../../components/ui/Modal';
import { QueryBoundary } from '../../components/states/QueryBoundary';
import { useMilestones, useApproveMilestone, useUpdateMilestone } from '../milestones/hooks';
import { MilestoneForm } from '../milestones/MilestoneForm';
import type { Milestone } from '../milestones/types';

export function MilestonesTab({ projectId }: { projectId: string }) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const query = useMilestones(projectId);
  const approveM = useApproveMilestone(projectId);
  const updateM = useUpdateMilestone(projectId);
  const isManager = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  const handleStatus = async (id: string, status: string) => {
    try {
      await updateM.mutateAsync({ id, data: { status } });
      addToast(`Milestone status updated to ${status}`, 'success');
    } catch (e: any) {
      addToast(e?.message || 'Failed to update milestone status', 'error');
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await approveM.mutateAsync(id);
      addToast('Milestone approved', 'success');
    } catch (e: any) {
      addToast(e?.message || 'Failed to approve milestone', 'error');
    }
  };

  const columns: Column<Milestone>[] = [
    { key: 'title', label: 'Title', render: (m) => <span style={{ fontWeight: 600 }}>{m.title}</span> },
    { key: 'dueDate', label: 'Due Date', render: (m) => <span>{m.dueDate || '-'}</span> },
    {
      key: 'billingAmount', label: 'Billing Amount',
      render: (m) => <span>${Number(m.billingAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>,
    },
    { key: 'status', label: 'Status', render: (m) => <StatusBadge status={m.status} /> },
    {
      key: 'eligibleForInvoice', label: 'Invoice Eligibility',
      render: (m) => (
        <span style={{ padding: '0.2rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, background: m.eligibleForInvoice ? '#dcfce7' : '#f1f5f9', color: m.eligibleForInvoice ? '#166534' : '#64748b' }}>
          {m.eligibleForInvoice ? 'Eligible' : 'Not Eligible'}
        </span>
      ),
    },
  ];

  if (isManager) {
    columns.push({
      key: 'actions', label: 'Actions',
      render: (m) => (
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {m.status === 'PENDING' && (
            <Button type="button" disabled={updateM.isPending} onClick={() => handleStatus(m.id, 'IN_PROGRESS')} style={{ background: '#2563eb', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
              Start
            </Button>
          )}
          {m.status === 'IN_PROGRESS' && (
            <Button type="button" disabled={updateM.isPending} onClick={() => handleStatus(m.id, 'COMPLETED')} style={{ background: '#0284c7', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
              Complete
            </Button>
          )}
          {m.status === 'COMPLETED' && (
            <Button type="button" disabled={approveM.isPending} onClick={() => handleApprove(m.id)} style={{ background: '#16a34a', padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
              Approve
            </Button>
          )}
        </div>
      ),
    });
  }

  return (
    <div style={{ background: '#fff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '1rem' }}>
      {isManager && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <Button type="button" onClick={() => setIsCreateOpen(true)} style={{ background: '#4f46e5' }}>+ Create Milestone</Button>
        </div>
      )}
      <QueryBoundary query={query} isEmpty={(d) => !d?.data || d.data.length === 0} emptyMessage="No milestones found for this project">
        <Table columns={columns} data={query.data?.data} />
      </QueryBoundary>
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create Milestone">
        {isCreateOpen && <MilestoneForm projectId={projectId} onClose={() => setIsCreateOpen(false)} />}
      </Modal>
    </div>
  );
}

export default MilestonesTab;
