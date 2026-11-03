import { useAuth } from '../auth/AuthProvider';
import { StatusBadge } from '../../components/ui/StatusBadge';
import type { Project } from './types';

function ProgressBar({ label, percent }: { label: string; percent: number }) {
  const p = Math.min(100, Math.max(0, percent));
  return (
    <div style={{ flex: 1, minWidth: '200px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '0.35rem' }}>
        <span>{label}</span>
        <span>{p}%</span>
      </div>
      <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
        <div style={{ width: `${p}%`, height: '100%', background: p === 100 ? '#16a34a' : '#4f46e5' }} />
      </div>
    </div>
  );
}

export function ProjectOverviewTab({ project }: { project: Project }) {
  const { user } = useAuth();
  const isFinanceVisible = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  const validMs = (project.milestones || []).filter((m) => m.status !== 'CANCELLED');
  const approvedMs = validMs.filter((m) => m.status === 'APPROVED');
  const milestoneProgress = validMs.length ? Math.round((approvedMs.length / validMs.length) * 100) : 0;
  const taskProgress = project.progressPercent ?? 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', background: '#fff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <div>
          <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Client</span>
          <div style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', marginTop: '0.2rem' }}>{project.client?.displayName || '-'}</div>
        </div>
        <div>
          <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Status</span>
          <div style={{ marginTop: '0.2rem' }}><StatusBadge status={project.status} /></div>
        </div>
        <div>
          <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Budget Amount</span>
          <div style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', marginTop: '0.2rem' }}>${Number(project.budgetAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        </div>
        <div>
          <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Dates</span>
          <div style={{ fontSize: '0.9rem', color: '#334155', marginTop: '0.2rem' }}>{project.startDate || 'TBD'} &rarr; {project.endDate || 'TBD'}</div>
        </div>
      </div>

      <div style={{ background: '#fff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ margin: '0 0 1rem', fontSize: '0.95rem', fontWeight: 700, color: '#1e293b' }}>Project Progress</h3>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <ProgressBar label="Task Progress" percent={taskProgress} />
          <ProgressBar label="Milestone Progress" percent={milestoneProgress} />
        </div>
      </div>

      {isFinanceVisible && (
        <div data-testid="finance-panels" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          <div style={{ background: '#fff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>Invoices Summary</h4>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginTop: '0.5rem' }}>{project.invoices?.length || 0} Invoices</div>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>Linked to approved project milestones</p>
          </div>
          <div style={{ background: '#fff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>Expenses Summary</h4>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginTop: '0.5rem' }}>{project.expenses?.length || 0} Recorded Expenses</div>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>Total tracked against project budget</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectOverviewTab;

