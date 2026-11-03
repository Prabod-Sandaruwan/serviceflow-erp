import { useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { Table, type Column } from '../../components/ui/Table';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Forms';
import { Modal } from '../../components/ui/Modal';
import { QueryBoundary } from '../../components/states/QueryBoundary';
import { useProjectTasks } from '../tasks/hooks';
import { useEmployees } from '../admin/hooks';
import { TaskForm } from '../tasks/TaskForm';
import type { Task } from '../tasks/types';

export function TasksTab({ projectId, milestones = [] }: { projectId: string; milestones?: any[] }) {
  const { user } = useAuth();
  const isStaff = user?.role === 'STAFF';
  const query = useProjectTasks(projectId);
  const empQuery = useEmployees(1, '');
  const [selectedTask, setSelectedTask] = useState<Task | null | undefined>(undefined);

  const employees = isStaff ? [] : (empQuery.data?.data || []).map((e: any) => ({ id: String(e.id), fullName: e.fullName || e.full_name }));

  const columns: Column<Task>[] = [
    {
      key: 'title',
      label: 'Title',
      render: (t) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontWeight: 600 }}>{t.title}</span>
          {t.isOverdue && (
            <span style={{ padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, background: '#fee2e2', color: '#991b1b' }}>
              Overdue
            </span>
          )}
        </div>
      ),
    },
    { key: 'assignee', label: 'Assignee', render: (t) => <span>{t.assignee?.fullName || '-'}</span> },
    { key: 'priority', label: 'Priority', render: (t) => <span style={{ fontWeight: 600, fontSize: '0.8rem' }}>{t.priority}</span> },
    { key: 'status', label: 'Status', render: (t) => <StatusBadge status={t.status} /> },
    { key: 'dueDate', label: 'Due Date', render: (t) => <span>{t.dueDate || '-'}</span> },
    {
      key: 'actions',
      label: 'Actions',
      render: (t) => (
        <Button type="button" variant="secondary" onClick={() => setSelectedTask(t)} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
          Edit
        </Button>
      ),
    },
  ];

  return (
    <div style={{ background: '#fff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '1rem' }}>
      {!isStaff && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <Button type="button" onClick={() => setSelectedTask(null)} style={{ background: '#4f46e5' }}>+ Create Task</Button>
        </div>
      )}

      <QueryBoundary query={query} isEmpty={(d) => !d?.data || d.data.length === 0} emptyMessage="No tasks found for this project">
        <Table columns={columns} data={query.data?.data} />
      </QueryBoundary>

      <Modal isOpen={selectedTask !== undefined} onClose={() => setSelectedTask(undefined)} title={selectedTask ? 'Edit Task' : 'Create Task'}>
        <TaskForm task={selectedTask} projectId={projectId} milestones={milestones} employees={employees} onClose={() => setSelectedTask(undefined)} />
      </Modal>
    </div>
  );
}

export default TasksTab;
