interface TaskProjectSelectProps {
  projectId: string;
  setProjectId: (v: string) => void;
  projectSearch?: string;
  setProjectSearch?: (v: string) => void;
  setMilestoneId: (v: string) => void;
  projects: any[];
}

export function TaskProjectSelect({
  projectId,
  setProjectId,
  projectSearch = "",
  setProjectSearch,
  setMilestoneId,
  projects,
}: TaskProjectSelectProps) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
        Target Project *
      </label>
      {setProjectSearch && (
        <input
          type="text"
          placeholder="Search projects..."
          value={projectSearch}
          onChange={(e) => setProjectSearch(e.target.value)}
          className="w-full mb-1.5 px-2.5 py-1 text-xs border border-slate-200 rounded-lg placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      )}
      <select
        value={projectId}
        onChange={(e) => {
          setProjectId(e.target.value);
          setMilestoneId("");
        }}
        required
        className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg"
      >
        <option value="">Select a project...</option>
        {projects.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name} ({p.projectCode})
          </option>
        ))}
      </select>
    </div>
  );
}
