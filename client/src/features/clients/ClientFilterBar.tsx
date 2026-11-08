import { Search, RotateCcw } from 'lucide-react';

export interface ClientFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  typeFilter: string;
  onTypeChange: (val: string) => void;
  statusFilter: string;
  onStatusChange: (val: string) => void;
  onRefresh: () => void;
  activeCount?: number;
}

export function ClientFilterBar({
  search, onSearchChange, typeFilter, onTypeChange, statusFilter, onStatusChange, onRefresh, activeCount = 0,
}: ClientFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-xs">
      {/* Search Input with ⌘K Badge */}
      <div className="relative flex flex-1 min-w-[240px] max-w-md items-center">
        <Search className="absolute left-3.5 h-4 w-4 text-slate-400" />
        <input
          id="client-search"
          type="text"
          placeholder="Search clients..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full rounded-xl border border-slate-200/80 bg-slate-50/60 py-2 pl-9 pr-10 text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-hidden"
        />
        <span className="absolute right-3 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-mono text-slate-400 shadow-2xs">
          ⌘K
        </span>
      </div>

      {/* Filter Selects & Refresh */}
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={typeFilter}
          onChange={(e) => onTypeChange(e.target.value)}
          aria-label="Filter by type"
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs focus:outline-hidden"
        >
          <option value="">All Types (Individual &amp; Company)</option>
          <option value="COMPANY">Company / Business</option>
          <option value="INDIVIDUAL">Individual</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          aria-label="Filter by status"
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs focus:outline-hidden"
        >
          <option value="">Status: All</option>
          <option value="true">Status: Active ({activeCount})</option>
          <option value="false">Status: Inactive</option>
        </select>

        <button
          type="button"
          onClick={onRefresh}
          title="Refresh client list"
          className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-800 shadow-2xs transition"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default ClientFilterBar;
