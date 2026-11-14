import { RotateCw, Search } from 'lucide-react';
import { useProjects } from '../projects/hooks';
import { EXPENSE_CATEGORIES } from './types';

interface ExpenseFilterBarProps {
  search: string;
  onSearchChange: (v: string) => void;
  category: string;
  onCategoryChange: (v: string) => void;
  status: string;
  onStatusChange: (v: string) => void;
  projectId: string;
  onProjectIdChange: (v: string) => void;
  onReset: () => void;
}

export function ExpenseFilterBar({
  search, onSearchChange, category, onCategoryChange,
  status, onStatusChange, projectId, onProjectIdChange, onReset,
}: ExpenseFilterBarProps) {
  const { data: projectsRes } = useProjects();
  const projects = projectsRes?.data || [];

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs mb-5 flex flex-wrap items-end gap-3.5">
      <div className="flex-1 min-w-[200px]">
        <label htmlFor="expense-search" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Search</label>
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            id="expense-search"
            type="text"
            placeholder="Search description, supplier..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-white text-xs border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
          />
        </div>
      </div>
      <div className="w-44">
        <label htmlFor="project-filter" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Project</label>
        <select
          id="project-filter"
          aria-label="Filter by project"
          value={projectId}
          onChange={(e) => onProjectIdChange(e.target.value)}
          className="w-full px-3 py-1.5 bg-white text-xs border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition cursor-pointer"
        >
          <option value="">All Projects</option>
          {projects.map((p) => <option key={String(p.id)} value={String(p.id)}>{p.projectCode ? `${p.projectCode} - ${p.name}` : p.name}</option>)}
        </select>
      </div>
      <div className="w-44">
        <label htmlFor="category-filter" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Category</label>
        <select
          id="category-filter"
          aria-label="Filter by category"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="w-full px-3 py-1.5 bg-white text-xs border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition cursor-pointer"
        >
          <option value="">All Categories</option>
          {EXPENSE_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>
      <div className="w-32">
        <label htmlFor="status-filter" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Status</label>
        <select
          id="status-filter"
          aria-label="Filter by status"
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="w-full px-3 py-1.5 bg-white text-xs border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition cursor-pointer"
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="VOIDED">Voided</option>
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

export default ExpenseFilterBar;
