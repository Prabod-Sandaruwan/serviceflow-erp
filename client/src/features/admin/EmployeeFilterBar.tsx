import { Search, RotateCw } from 'lucide-react';

interface EmployeeFilterBarProps {
  search: string;
  onSearchChange: (v: string) => void;
  role: string;
  onRoleChange: (v: string) => void;
  status: string;
  onStatusChange: (v: string) => void;
  onRefresh: () => void;
}

export function EmployeeFilterBar({
  search,
  onSearchChange,
  role,
  onRoleChange,
  status,
  onStatusChange,
  onRefresh,
}: EmployeeFilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
      <div className="relative flex-1 max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          id="emp-search"
          placeholder="Search employees..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-white text-xs border border-slate-200 rounded-xl placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-2xs"
        />
      </div>

      <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
        <select
          value={role}
          onChange={(e) => onRoleChange(e.target.value)}
          aria-label="Filter by Role"
          className="px-3 py-2 bg-white text-xs border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-2xs cursor-pointer"
        >
          <option value="">All Roles</option>
          <option value="ADMIN">Admin</option>
          <option value="MANAGER">Manager</option>
          <option value="STAFF">Staff</option>
        </select>

        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          aria-label="Filter by Status"
          className="px-3 py-2 bg-white text-xs border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-2xs cursor-pointer"
        >
          <option value="">All Statuses</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>

        <button
          type="button"
          onClick={onRefresh}
          className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition shadow-2xs"
          title="Refresh employees"
          aria-label="Refresh"
        >
          <RotateCw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default EmployeeFilterBar;
