interface Props {
  assigneeId: string;
  setAssigneeId: (v: string) => void;
  milestoneId: string;
  setMilestoneId: (v: string) => void;
  projectId: string;
  employees: any[];
  milestones: any[];
}

export function TaskAssigneeMilestone({
  assigneeId,
  setAssigneeId,
  milestoneId,
  setMilestoneId,
  projectId,
  employees,
  milestones,
}: Props) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
          Assignee
        </label>
        <select
          value={assigneeId}
          onChange={(e) => setAssigneeId(e.target.value)}
          className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
        >
          <option value="">Unassigned</option>
          {employees.map((e: any) => (
            <option key={e.id} value={e.id}>
              {e.fullName || e.email}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
          Milestone
        </label>
        <select
          value={milestoneId}
          onChange={(e) => setMilestoneId(e.target.value)}
          disabled={!projectId}
          className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg disabled:opacity-50"
        >
          <option value="">None</option>
          {milestones.map((m: any) => (
            <option key={m.id} value={m.id}>
              {m.title || `Milestone ${m.id}`}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
