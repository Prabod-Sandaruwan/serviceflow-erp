interface TaskCreateFieldsProps {
  projectId: string;
  setProjectId: (v: string) => void;
  title: string;
  setTitle: (v: string) => void;
  priority: string;
  setPriority: (v: string) => void;
  assigneeId: string;
  setAssigneeId: (v: string) => void;
  milestoneId: string;
  setMilestoneId: (v: string) => void;
  dueDate: string;
  setDueDate: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  projects: any[];
  employees: any[];
  milestones: any[];
}

export function TaskCreateFields(props: TaskCreateFieldsProps) {
  const {
    projectId, setProjectId, title, setTitle, priority, setPriority,
    assigneeId, setAssigneeId, milestoneId, setMilestoneId, dueDate, setDueDate,
    description, setDescription, projects, employees, milestones,
  } = props;

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Target Project *</label>
        <select value={projectId} onChange={(e) => { setProjectId(e.target.value); setMilestoneId(''); }} required className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg">
          <option value="">Select a project...</option>
          {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Title *</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Architecture Blueprint" className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Assignee</label>
          <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg">
            <option value="">Unassigned</option>
            {employees.map((e: any) => <option key={e.id} value={e.id}>{e.fullName || e.email}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Milestone</label>
          <select value={milestoneId} onChange={(e) => setMilestoneId(e.target.value)} disabled={!projectId} className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg disabled:opacity-50">
            <option value="">None</option>
            {milestones.map((m: any) => <option key={m.id} value={m.id}>{m.title || `Milestone ${m.id}`}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Priority</label>
          <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg">
            <option value="LOW">Low</option><option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option><option value="URGENT">Urgent</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Due Date</label>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Optional details..." className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg" />
      </div>
    </div>
  );
}

export default TaskCreateFields;
