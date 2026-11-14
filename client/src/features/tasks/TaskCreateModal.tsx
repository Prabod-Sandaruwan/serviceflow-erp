import { useState } from 'react';
import { useProjects } from '../projects/hooks';
import { useCreateTask } from './hooks';
import { useToast } from '../../components/ui/Toast';

interface TaskCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TaskCreateModal({ isOpen, onClose }: TaskCreateModalProps) {
  const { data: projectsData } = useProjects({ pageSize: 50 });
  const projects = projectsData?.data || [];
  const [projectId, setProjectId] = useState('');
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');
  const createM = useCreateTask(projectId);
  const { addToast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) { addToast('Please select a project', 'error'); return; }
    if (!title.trim()) { addToast('Task title is required', 'error'); return; }
    try {
      await createM.mutateAsync({
        title: title.trim(),
        priority,
        dueDate: dueDate || null,
        description: description.trim() || null,
      });
      addToast('Task created successfully', 'success');
      onClose();
    } catch {
      addToast('Failed to create task', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-base">Create New Task</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Target Project *</label>
            <select value={projectId} onChange={(e) => setProjectId(e.target.value)} required className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg">
              <option value="">Select a project...</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Title *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Architecture Blueprint" className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg">
                <option value="LOW">Low</option><option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option><option value="URGENT">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Due Date</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Optional details..." className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg" />
          </div>
          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
            <button type="submit" disabled={createM.isPending} className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm disabled:opacity-50">
              {createM.isPending ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskCreateModal;
