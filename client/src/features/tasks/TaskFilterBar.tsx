interface TaskFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  priority: string;
  onPriorityChange: (val: string) => void;
  status: string;
  onStatusChange: (val: string) => void;
  sort: string;
  onSortChange: (val: string) => void;
  overdue: boolean;
  onOverdueChange: (val: boolean) => void;
  onRefresh: () => void;
}

const PRIORITIES = [
  { value: '', label: 'All Priorities' }, { value: 'HIGH', label: 'High' },
  { value: 'MEDIUM', label: 'Medium' }, { value: 'LOW', label: 'Low' }, { value: 'URGENT', label: 'Urgent' },
];

const STATUSES = [
  { value: '', label: 'All Statuses' }, { value: 'TODO', label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' }, { value: 'DONE', label: 'Done' }, { value: 'CANCELLED', label: 'Cancelled' },
];

const SORTS = [
  { value: 'createdAt:desc', label: 'Newest First' }, { value: 'createdAt:asc', label: 'Oldest First' },
  { value: 'dueDate:asc', label: 'Due Date' }, { value: 'priority:desc', label: 'Priority (High to Low)' },
];

export function TaskFilterBar({
  search, onSearchChange, priority, onPriorityChange, status, onStatusChange,
  sort, onSortChange, overdue, onOverdueChange, onRefresh,
}: TaskFilterBarProps) {
  return (
    <section className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 mb-6" data-purpose="tasks-filter-bar">
      <div className="relative w-full md:w-80">
        <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-12 py-2 text-xs bg-slate-50/70 border border-slate-200 rounded-lg placeholder-slate-400 focus:bg-white focus:ring-1 focus:ring-blue-600 transition-all"
          placeholder="Search tasks, assignees..."
          type="text"
        />
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-medium px-1.5 py-0.5 border border-slate-200 bg-white rounded">⌘K</span>
      </div>

      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
        <div className="relative">
          <select id="task-filter-priority" value={priority} onChange={(e) => onPriorityChange(e.target.value)} className="appearance-none bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 py-2 pl-3 pr-8 focus:ring-1 focus:ring-blue-600 cursor-pointer shadow-2xs">
            {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
          </div>
        </div>

        <div className="relative">
          <select id="task-filter-status" value={status} onChange={(e) => onStatusChange(e.target.value)} className="appearance-none bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 py-2 pl-3 pr-8 focus:ring-1 focus:ring-blue-600 cursor-pointer shadow-2xs">
            {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
          </div>
        </div>

        <div className="relative">
          <select id="task-filter-sort" value={sort} onChange={(e) => onSortChange(e.target.value)} className="appearance-none bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 py-2 pl-3 pr-8 focus:ring-1 focus:ring-blue-600 cursor-pointer shadow-2xs">
            {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
          </div>
        </div>

        <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 select-none px-1">
          <input id="overdue-filter" className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500" type="checkbox" checked={overdue} onChange={(e) => onOverdueChange(e.target.checked)} />
          <span>Overdue Only</span>
        </label>

        <button onClick={onRefresh} className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs" title="Refresh Table">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
        </button>
      </div>
    </section>
  );
}

export default TaskFilterBar;
