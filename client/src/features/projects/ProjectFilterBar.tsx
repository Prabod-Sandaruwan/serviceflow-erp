import { Search, RotateCw } from 'lucide-react';

interface ProjectFilterBarProps {
  search: string;
  onSearchChange: (v: string) => void;
  status: string;
  onStatusChange: (v: string) => void;
  onReset: () => void;
}

export const STATUS_OPTS = [
  { value: '', label: 'All Statuses' },
  { value: 'PLANNED', label: 'Planned' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'ON_HOLD', label: 'On Hold' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export function ProjectFilterBar({
  search, onSearchChange, status, onStatusChange, onReset,
}: ProjectFilterBarProps) {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs mb-5 flex flex-wrap items-end gap-3.5">
      <div className="flex-1 min-w-[220px]">
        <label htmlFor="project-search" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Search</label>
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            id="project-search"
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-white text-xs border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
          />
        </div>
      </div>

      <div className="w-48">
        <label htmlFor="status-filter" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Status</label>
        <select
          id="status-filter"
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="w-full px-3 py-1.5 bg-white text-xs border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition cursor-pointer"
        >
          {STATUS_OPTS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <button
        type="button"
        onClick={onReset}
        title="Reset filters"
        className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition flex items-center justify-center shrink-0 cursor-pointer"
      >
        <RotateCw className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default ProjectFilterBar;
