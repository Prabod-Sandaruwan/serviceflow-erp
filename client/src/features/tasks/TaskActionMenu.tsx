import { useState, useRef, useEffect } from 'react';
import { useUpdateTask } from './hooks';
import { useToast } from '../../components/ui/Toast';
import type { Task } from './types';

interface TaskActionMenuProps {
  task: Task;
  onEdit: () => void;
}

export function TaskActionMenu({ task, onEdit }: TaskActionMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const updateM = useUpdateTask(task.projectId);
  const { addToast } = useToast();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleStatusChange = async (status: string) => {
    setOpen(false);
    try {
      await updateM.mutateAsync({ id: task.id, data: { status } });
      addToast(`Task marked as ${status}`, 'success');
    } catch {
      addToast('Failed to update task status', 'error');
    }
  };

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
        title="More options"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-30 text-xs">
          <button type="button" onClick={() => { setOpen(false); onEdit(); }} className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-700">
            Edit Details
          </button>
          {task.status !== 'IN_PROGRESS' && (
            <button type="button" onClick={() => handleStatusChange('IN_PROGRESS')} className="w-full text-left px-3.5 py-2 hover:bg-amber-50 text-amber-700">
              Mark In Progress
            </button>
          )}
          {task.status !== 'DONE' && (
            <button type="button" onClick={() => handleStatusChange('DONE')} className="w-full text-left px-3.5 py-2 hover:bg-emerald-50 text-emerald-700 font-medium">
              Mark Done
            </button>
          )}
          {task.status !== 'TODO' && (
            <button type="button" onClick={() => handleStatusChange('TODO')} className="w-full text-left px-3.5 py-2 hover:bg-slate-50 text-slate-600">
              Move to To Do
            </button>
          )}
          {task.status !== 'CANCELLED' && (
            <button type="button" onClick={() => handleStatusChange('CANCELLED')} className="w-full text-left px-3.5 py-2 hover:bg-rose-50 text-rose-600 border-t border-slate-100">
              Cancel Task
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default TaskActionMenu;

