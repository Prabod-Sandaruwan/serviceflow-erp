import { Search, RotateCw } from 'lucide-react';

interface FollowUpFilterBarProps {
  search: string;
  onSearchChange: (v: string) => void;
  status: string;
  onStatusChange: (v: string) => void;
  overdue: boolean;
  onOverdueChange: (v: boolean) => void;
  onReset: () => void;
}

export function FollowUpFilterBar({
  search, onSearchChange, status, onStatusChange, overdue, onOverdueChange, onReset,
}: FollowUpFilterBarProps) {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs mb-5 flex flex-wrap items-end gap-3.5">
      <div className="flex-1 min-w-[200px]">
        <label htmlFor="followup-search" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Search</label>
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            id="followup-search"
            type="text"
            placeholder="Search notes or lead ID..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-white text-xs border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
          />
        </div>
      </div>

      <div className="w-36">
        <label htmlFor="followup-status" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Status</label>
        <select
          id="followup-status"
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="w-full px-3 py-1.5 bg-white text-xs border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition cursor-pointer"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="DONE">Completed</option>
        </select>
      </div>

      <div className="flex items-center gap-2 pb-2">
        <input
          id="followup-overdue-checkbox"
          type="checkbox"
          checked={overdue}
          onChange={(e) => onOverdueChange(e.target.checked)}
          className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300 cursor-pointer"
        />
        <label htmlFor="followup-overdue-checkbox" className="text-xs font-semibold text-slate-700 cursor-pointer select-none">
          Overdue only
        </label>
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

export default FollowUpFilterBar;
