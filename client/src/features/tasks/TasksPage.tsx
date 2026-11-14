import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { useTasks } from './hooks';
import { Table } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { Modal } from '../../components/ui/Modal';
import { QueryBoundary } from '../../components/states/QueryBoundary';
import { TaskStats } from './TaskStats';
import { TaskFilterBar } from './TaskFilterBar';
import { getTaskColumns } from './taskColumns';
import { TaskKanbanBoard } from './TaskKanbanBoard';
import { TaskCreateModal } from './TaskCreateModal';
import { TaskForm } from './TaskForm';
import { downloadAllTasksCsv } from './exportTasks';
import type { Task } from './types';

export function TasksPage() {
  const { user } = useAuth();
  const isStaff = user?.role === 'STAFF';
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'table' | 'board'>('table');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const page = searchParams.get('page') || '1';
  const priority = searchParams.get('priority') || '';
  const status = searchParams.get('status') || '';
  const sort = searchParams.get('sort') || 'createdAt:desc';
  const search = searchParams.get('search') || '';
  const overdue = searchParams.get('overdue') === 'true';

  const [sortBy, sortOrder] = sort.split(':');
  const empId = user?.employee?.id || user?.employeeId;
  const assigneeId = isStaff ? (empId ? String(empId) : undefined) : (searchParams.get('assigneeId') || undefined);

  const query = useTasks({ page, priority: priority || undefined, status: status || undefined, overdue: overdue ? true : undefined, search: search || undefined, assigneeId, sortBy, sortOrder });
  const tasks = query.data?.data || [];

  const setFilter = (k: string, v: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (v) next.set(k, v); else next.delete(k);
      next.set('page', '1');
      return next;
    });
  };

  const columns = useMemo(() => getTaskColumns((t) => setEditingTask(t)), []);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Tasks</h1>
          <p className="text-xs text-slate-500 mt-1">Manage assignments, priorities, and deadlines across projects</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="inline-flex p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs">
            <button type="button" onClick={() => setViewMode('table')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition ${viewMode === 'table' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}>Table</button>
            <button type="button" onClick={() => setViewMode('board')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition ${viewMode === 'board' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}>Board</button>
          </div>
          <button type="button" onClick={() => downloadAllTasksCsv(tasks)} className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-xs">Export Tasks</button>
          <button type="button" onClick={() => setCreateOpen(true)} className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs shadow-blue-500/20">Create Task</button>
        </div>
      </section>

      <TaskStats fallbackTasks={tasks} />
      <TaskFilterBar search={search} onSearchChange={(v) => setFilter('search', v)} priority={priority} onPriorityChange={(v) => setFilter('priority', v)} status={status} onStatusChange={(v) => setFilter('status', v)} sort={sort} onSortChange={(v) => setFilter('sort', v)} overdue={overdue} onOverdueChange={(v) => setFilter('overdue', v ? 'true' : '')} onRefresh={() => query.refetch()} />

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs p-5">
        <QueryBoundary query={query} isEmpty={(d) => !d?.data || d.data.length === 0} emptyMessage="No tasks found matching filters">
          {viewMode === 'table' ? (
            <>
              <Table columns={columns} data={tasks} />
              <Pagination page={Number(page)} totalPages={query.data?.meta?.totalPages || 1} onPageChange={(p) => setFilter('page', String(p))} />
            </>
          ) : (
            <TaskKanbanBoard tasks={tasks} onEdit={(t) => setEditingTask(t)} />
          )}
        </QueryBoundary>
      </div>

      {createOpen && <TaskCreateModal isOpen={createOpen} onClose={() => setCreateOpen(false)} />}
      <Modal isOpen={Boolean(editingTask)} onClose={() => setEditingTask(null)} title="Edit Task">
        {editingTask && <TaskForm key={editingTask.id} task={editingTask} projectId={editingTask.projectId} onClose={() => setEditingTask(null)} />}
      </Modal>
    </div>
  );
}

export default TasksPage;
