import { RotateCw } from 'lucide-react';

interface InvoiceFilterBarProps {
  status: string;
  onStatusChange: (v: string) => void;
  clientId: string;
  onClientIdChange: (v: string) => void;
  projectId: string;
  onProjectIdChange: (v: string) => void;
  overdue: boolean;
  onOverdueChange: (v: boolean) => void;
  onRefresh: () => void;
}

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'ISSUED', label: 'Issued' },
  { value: 'PARTIALLY_PAID', label: 'Partially Paid' },
  { value: 'PAID', label: 'Paid' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export function InvoiceFilterBar({
  status, onStatusChange, clientId, onClientIdChange,
  projectId, onProjectIdChange, overdue, onOverdueChange, onRefresh,
}: InvoiceFilterBarProps) {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs mb-5 flex flex-wrap items-end gap-3.5">
      <div className="flex-1 min-w-[150px]">
        <label htmlFor="status-filter" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Status</label>
        <select
          id="status-filter"
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="w-full px-3 py-1.5 bg-white text-xs border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition cursor-pointer"
        >
          {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <div className="w-36">
        <label htmlFor="client-filter" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Client ID</label>
        <input
          id="client-filter"
          type="text"
          placeholder="Client ID"
          value={clientId}
          onChange={(e) => onClientIdChange(e.target.value)}
          className="w-full px-3 py-1.5 bg-white text-xs border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
        />
      </div>

      <div className="w-36">
        <label htmlFor="project-filter" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Project ID</label>
        <input
          id="project-filter"
          type="text"
          placeholder="Project ID"
          value={projectId}
          onChange={(e) => onProjectIdChange(e.target.value)}
          className="w-full px-3 py-1.5 bg-white text-xs border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
        />
      </div>

      <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 pb-2">
        <input
          type="checkbox"
          checked={overdue}
          onChange={(e) => onOverdueChange(e.target.checked)}
          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
        />
        <span>Overdue only</span>
      </label>

      <button
        type="button"
        onClick={onRefresh}
        className="ml-auto p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition shadow-2xs mb-0.5"
        title="Refresh table"
        aria-label="Refresh"
      >
        <RotateCw className="w-4 h-4" />
      </button>
    </div>
  );
}

export default InvoiceFilterBar;

