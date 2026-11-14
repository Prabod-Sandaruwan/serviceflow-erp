import type { Column } from '../../components/ui/Table';
import type { Task } from './types';
import { TaskActionMenu } from './TaskActionMenu';

const PRIORITY_STYLES: Record<string, string> = {
  HIGH: 'bg-rose-50 text-rose-700 border border-rose-200/60',
  MEDIUM: 'bg-amber-50 text-amber-700 border border-amber-200/60',
  LOW: 'bg-slate-100 text-slate-600 border border-slate-200/80',
  URGENT: 'bg-red-100 text-red-800 border border-red-300 font-bold',
};

const STATUS_STYLES: Record<string, string> = {
  TODO: 'bg-slate-100 text-slate-700 border border-slate-200',
  IN_PROGRESS: 'bg-amber-50 text-amber-700 border border-amber-200 font-medium',
  DONE: 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium',
  CANCELLED: 'bg-slate-100 text-slate-500 border border-slate-200',
};

export function getTaskColumns(onEdit: (t: Task) => void): Column<Task>[] {
  return [
    {
      key: 'title', label: 'Title',
      render: (t) => (
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-900">{t.title}</span>
          {t.isOverdue && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
              Overdue
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'priority', label: 'Priority',
      render: (t) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${PRIORITY_STYLES[t.priority] || 'bg-slate-100 text-slate-600'}`}>
          {t.priority}
        </span>
      ),
    },
    {
      key: 'status', label: 'Status',
      render: (t) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] ${STATUS_STYLES[t.status] || 'bg-slate-100 text-slate-700'}`}>
          {t.status}
        </span>
      ),
    },
    {
      key: 'assignee', label: 'Assignee',
      render: (t) => {
        if (!t.assignee?.fullName) return <span className="text-slate-400 font-mono">-</span>;
        const initials = t.assignee.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
        return (
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-semibold text-[10px] flex items-center justify-center border border-slate-300">
              {initials}
            </span>
            <span className="font-medium text-slate-800">{t.assignee.fullName}</span>
          </div>
        );
      },
    },
    {
      key: 'dueDate', label: 'Due Date',
      render: (t) => (
        t.dueDate ? (
          <span className="inline-flex items-center gap-1 font-mono text-[11px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
            <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
            {t.dueDate}
          </span>
        ) : <span className="text-slate-400 font-mono">-</span>
      ),
    },
    {
      key: 'actions', label: 'Actions',
      render: (t) => (
        <div className="flex items-center justify-end gap-1.5">
          <button type="button" onClick={() => onEdit(t)} className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-md transition-colors shadow-2xs">
            Edit
          </button>
          <TaskActionMenu task={t} onEdit={() => onEdit(t)} />
        </div>
      ),
    },
  ];
}
