import { useAuth } from '../auth/AuthProvider';
import { useToast } from '../../components/ui/Toast';
import { Table, type Column } from '../../components/ui/Table';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Forms';
import { QueryBoundary } from '../../components/states/QueryBoundary';
import { useMilestones, useApproveMilestone } from '../milestones/hooks';
import type { Milestone } from '../milestones/types';

export function MilestonesTab({ projectId }: { projectId: string }) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const query = useMilestones(projectId);
  const approveM = useApproveMilestone(projectId);
  const isManager = user?.role === 'ADMIN' || user?.role === 'MANAGER';

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
      key: 'billingAmount',
      label: 'Billing Amount',
      render: (m) => <span>${Number(m.billingAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>,
    },
    { key: 'status', label: 'Status', render: (m) => <StatusBadge status={m.status} /> },
    {
      key: 'eligibleForInvoice',
      label: 'Invoice Eligibility',
      render: (m) =>
        m.eligibleForInvoice ? (
          <span style={{ padding: '0.2rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, background: '#dcfce7', color: '#166534' }}>
            Eligible
          </span>
        ) : (
          <span style={{ padding: '0.2rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, background: '#f1f5f9', color: '#64748b' }}>
            Not Eligible
          </span>
        ),
    },
  ];

  if (isManager) {
    columns.push({
      key: 'actions',
      label: 'Actions',
      render: (m) =>
        m.status === 'COMPLETED' ? (
          <Button type="button" disabled={approveM.isPending} onClick={() => handleApprove(m.id)} style={{ background: '#16a34a', padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>
            Approve
          </Button>
        ) : null,
    });
  }

  return (
    <div style={{ background: '#fff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '1rem' }}>
      <QueryBoundary query={query} isEmpty={(d) => !d?.data || d.data.length === 0} emptyMessage="No milestones found for this project">
        <Table columns={columns} data={query.data?.data} />
      </QueryBoundary>
    </div>
  );
}

export default MilestonesTab;
