import type { Task } from './types';
import { useUpdateTask } from './hooks';
import { useToast } from '../../components/ui/Toast';

interface TaskKanbanBoardProps {
  tasks: Task[];
  onEdit: (t: Task) => void;
}

const COLUMNS = [
  { id: 'TODO', title: 'To Do', border: 'border-blue-500', badge: 'bg-blue-100 text-blue-700' },
  { id: 'IN_PROGRESS', title: 'In Progress', border: 'border-amber-500', badge: 'bg-amber-100 text-amber-700' },
  { id: 'DONE', title: 'Done', border: 'border-emerald-500', badge: 'bg-emerald-100 text-emerald-700' },
  { id: 'CANCELLED', title: 'Cancelled', border: 'border-slate-400', badge: 'bg-slate-100 text-slate-700' },
];

export function TaskKanbanBoard({ tasks, onEdit }: TaskKanbanBoardProps) {
  const updateM = useUpdateTask();
  const { addToast } = useToast();

  const handleAdvance = async (t: Task, nextStatus: string) => {
    try {
      await updateM.mutateAsync({ id: t.id, data: { status: nextStatus } });
      addToast(`Moved to ${nextStatus}`, 'success');
    } catch {
      addToast('Failed to update status', 'error');
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto pb-4">
      {COLUMNS.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.id);
        return (
          <div key={col.id} className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-200/60 flex flex-col min-h-[420px]">
            <div className={`flex items-center justify-between pb-2 mb-3 border-b-2 ${col.border}`}>
              <span className="text-xs font-bold text-slate-800">{col.title}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${col.badge}`}>{colTasks.length}</span>
            </div>
            <div className="space-y-2.5 flex-1 overflow-y-auto">
              {colTasks.length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-400 font-medium">No tasks</div>
              ) : (
                colTasks.map((t) => (
                  <div key={t.id} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-sm transition text-xs space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <button type="button" onClick={() => onEdit(t)} className="font-semibold text-slate-900 text-left hover:text-blue-600 line-clamp-2">
                        {t.title}
                      </button>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">{t.priority}</span>
                    </div>
                    {t.dueDate && <div className="text-[11px] font-mono text-slate-500">Due: {t.dueDate}</div>}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <span className="text-[11px] text-slate-600 font-medium truncate max-w-[120px]">{t.assignee?.fullName || 'Unassigned'}</span>
                      {col.id === 'TODO' && (
                        <button type="button" onClick={() => handleAdvance(t, 'IN_PROGRESS')} className="text-[10px] font-semibold text-blue-600 hover:text-blue-800">Start →</button>
                      )}
                      {col.id === 'IN_PROGRESS' && (
                        <button type="button" onClick={() => handleAdvance(t, 'DONE')} className="text-[10px] font-semibold text-emerald-600 hover:text-emerald-800">Done ✓</button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default TaskKanbanBoard;

