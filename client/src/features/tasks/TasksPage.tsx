import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { useTasks } from './hooks';
import { Table, type Column } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button, Select } from '../../components/ui/Forms';
import { Modal } from '../../components/ui/Modal';
import { QueryBoundary } from '../../components/states/QueryBoundary';
import { TaskForm } from './TaskForm';
import type { Task } from './types';

const PRIORITIES = [
  { value: '', label: 'All Priorities' }, { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' }, { value: 'HIGH', label: 'High' }, { value: 'URGENT', label: 'Urgent' },
];
const STATUSES = [
  { value: '', label: 'All Statuses' }, { value: 'TODO', label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' }, { value: 'DONE', label: 'Done' }, { value: 'CANCELLED', label: 'Cancelled' },
];

export function TasksPage() {
  const { user } = useAuth();
  const isStaff = user?.role === 'STAFF';
  const [searchParams, setSearchParams] = useSearchParams();
  const page = searchParams.get('page') || '1';
  const priority = searchParams.get('priority') || '';
  const status = searchParams.get('status') || '';
  const overdue = searchParams.get('overdue') === 'true';
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const empId = user?.employee?.id || user?.employeeId;
  const assigneeId = isStaff ? (empId ? String(empId) : undefined) : (searchParams.get('assigneeId') || undefined);
  const query = useTasks({ page, priority: priority || undefined, status: status || undefined, overdue: overdue ? true : undefined, assigneeId });

  const setFilter = (k: string, v: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (v) next.set(k, v); else next.delete(k);
      next.set('page', '1');
      return next;
    });
  };

  const columns: Column<Task>[] = useMemo(() => [
    {
      key: 'title', label: 'Title',
      render: (t) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontWeight: 600 }}>{t.title}</span>
          {t.isOverdue && <span style={{ padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700, background: '#fee2e2', color: '#991b1b' }}>Overdue</span>}
        </div>
      ),
    },
    { key: 'priority', label: 'Priority', render: (t) => <span style={{ fontWeight: 600, fontSize: '0.8rem' }}>{t.priority}</span> },
    { key: 'status', label: 'Status', render: (t) => <StatusBadge status={t.status} /> },
    { key: 'assignee', label: 'Assignee', render: (t) => <span>{t.assignee?.fullName || '-'}</span> },
    { key: 'dueDate', label: 'Due Date', render: (t) => <span>{t.dueDate || '-'}</span> },
    {
      key: 'actions', label: 'Actions',
      render: (t) => <Button type="button" variant="secondary" onClick={() => setEditingTask(t)} style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>Edit</Button>,
    },
  ], []);

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>Tasks</h1>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>Manage assignments, priorities, and deadlines across projects</p>
      </div>
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ width: '160px' }}><Select id="task-filter-priority" value={priority} options={PRIORITIES} onChange={(e) => setFilter('priority', e.target.value)} /></div>
        <div style={{ width: '160px' }}><Select id="task-filter-status" value={status} options={STATUSES} onChange={(e) => setFilter('status', e.target.value)} /></div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
          <input type="checkbox" id="overdue-filter" checked={overdue} onChange={(e) => setFilter('overdue', e.target.checked ? 'true' : '')} /> Overdue Only
        </label>
      </div>
      <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
        <QueryBoundary query={query} isEmpty={(d) => !d?.data || d.data.length === 0} emptyMessage="No tasks found matching filters">
          <Table columns={columns} data={query.data?.data} />
          <Pagination page={Number(page)} totalPages={query.data?.meta?.totalPages || 1} onPageChange={(p) => setFilter('page', String(p))} />
        </QueryBoundary>
      </div>
      <Modal isOpen={Boolean(editingTask)} onClose={() => setEditingTask(null)} title="Edit Task">
        {editingTask && <TaskForm task={editingTask} projectId={editingTask.projectId} onClose={() => setEditingTask(null)} />}
      </Modal>
    </div>
  );
}

export default TasksPage;
