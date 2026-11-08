import { Search, RotateCw, LayoutGrid, List } from 'lucide-react';

interface LeadFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  status: string;
  onStatusChange: (val: string) => void;
  ownerId: string;
  onOwnerIdChange: (val: string) => void;
  isStaff: boolean;
  onRefresh: () => void;
  viewMode: 'table' | 'board';
  onViewModeChange: (mode: 'table' | 'board') => void;
}

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'NEW', label: 'New' },
  { value: 'CONTACTED', label: 'Contacted' },
  { value: 'QUALIFIED', label: 'Qualified' },
  { value: 'PROPOSAL_SENT', label: 'Proposal Sent' },
  { value: 'CONVERTED', label: 'Converted' },
  { value: 'LOST', label: 'Lost' },
];

export function LeadFilterBar({
  search, onSearchChange, status, onStatusChange,
  ownerId, onOwnerIdChange, isStaff, onRefresh,
  viewMode, onViewModeChange,
}: LeadFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            id="lead-search" type="text" placeholder="Search leads..." value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-10 py-2 text-xs rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 font-mono">⌘K</kbd>
        </div>

        <select
          id="lead-status" value={status} onChange={(e) => onStatusChange(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
        >
          {statusOptions.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
        </select>

        {!isStaff && (
          <input
            id="lead-owner" type="text" placeholder="Filter by Owner ID..." value={ownerId}
            onChange={(e) => onOwnerIdChange(e.target.value)}
            className="w-40 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
          />
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button" onClick={onRefresh} title="Refresh leads"
          className="p-2 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition"
        >
          <RotateCw className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center p-1 rounded-xl border border-slate-200 bg-white text-xs font-semibold">
          <button
            type="button" onClick={() => onViewModeChange('table')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition ${viewMode === 'table' ? 'bg-slate-100 text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <List className="w-3.5 h-3.5" /><span>Table</span>
          </button>
          <button
            type="button" onClick={() => onViewModeChange('board')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition ${viewMode === 'board' ? 'bg-slate-100 text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <LayoutGrid className="w-3.5 h-3.5" /><span>Board</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default LeadFilterBar;
