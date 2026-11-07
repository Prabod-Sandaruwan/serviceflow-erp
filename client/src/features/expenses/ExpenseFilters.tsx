import { useProjects } from '../projects/hooks';
import type { UseExpensesFilters } from './hooks';

const CATEGORIES = [
  'SOFTWARE_LICENSE', 'HOSTING_INFRASTRUCTURE', 'THIRD_PARTY_SERVICE',
  'TRAVEL', 'SUBCONTRACTOR', 'MATERIALS', 'EQUIPMENT', 'OTHER',
];

interface ExpenseFiltersProps {
  filters: UseExpensesFilters;
  onChange: (filters: UseExpensesFilters) => void;
}

export function ExpenseFilters({ filters, onChange }: ExpenseFiltersProps) {
  const { data: projectsRes } = useProjects();
  const projects = projectsRes?.data || [];

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
      <select
        value={filters.projectId || ''}
        onChange={(e) => onChange({ ...filters, projectId: e.target.value || undefined })}
        className="rounded border p-1.5 text-xs text-slate-700"
        aria-label="Filter by project"
      >
        <option value="">All Projects</option>
        {projects.map((p) => (
          <option key={p.id} value={String(p.id)}>{p.name || p.projectCode || p.id}</option>
        ))}
      </select>

      <select
        value={filters.category || ''}
        onChange={(e) => onChange({ ...filters, category: e.target.value || undefined })}
        className="rounded border p-1.5 text-xs text-slate-700"
        aria-label="Filter by category"
      >
        <option value="">All Categories</option>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
        ))}
      </select>

      <input
        type="date"
        value={filters.from || ''}
        onChange={(e) => onChange({ ...filters, from: e.target.value || undefined })}
        className="rounded border p-1.5 text-xs text-slate-700"
        aria-label="Filter from date"
      />

      <input
        type="date"
        value={filters.to || ''}
        onChange={(e) => onChange({ ...filters, to: e.target.value || undefined })}
        className="rounded border p-1.5 text-xs text-slate-700"
        aria-label="Filter to date"
      />
    </div>
  );
}

export default ExpenseFilters;
