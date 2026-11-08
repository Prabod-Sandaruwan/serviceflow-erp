import { Link } from 'react-router-dom';
import { FolderKanban, Eye, Plus } from 'lucide-react';
import type { Project } from '../projects/types';

interface ClientProjectsTableProps {
  projects: Project[];
  clientId: string;
}

const formatDate = (ds?: string) => {
  if (!ds) return '-';
  try {
    const d = new Date(ds);
    return isNaN(d.getTime()) ? '-' : d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  } catch { return '-'; }
};

const getProjectBadge = (status: string) => {
  const isInProgress = status === 'IN_PROGRESS';
  const isDone = status === 'COMPLETED';
  const color = isInProgress
    ? 'bg-sky-50 text-sky-700 border-sky-200'
    : isDone
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : 'bg-slate-100 text-slate-700 border-slate-200';
  return (
    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-md border ${color}`}>
      {status === 'IN_PROGRESS' ? 'In Progress' : status === 'COMPLETED' ? 'Completed' : status}
    </span>
  );
};

export function ClientProjectsTable({ projects, clientId }: ClientProjectsTableProps) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600"><FolderKanban className="w-4 h-4" /></div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">Projects</h2>
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">{projects.length}</span>
        </div>
        <Link to={`/quotations/new?clientId=${clientId}`} className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700">
          <Plus className="w-3.5 h-3.5" />
          <span>New Project</span>
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              <th className="py-2.5 px-3">Project Name</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3">Due Date</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {projects.length === 0 ? (
              <tr><td colSpan={4} className="py-6 text-center text-slate-400 font-medium">No associated projects found</td></tr>
            ) : (
              projects.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-3 font-semibold text-slate-800">
                    <Link to={`/projects/${p.id}`} className="hover:text-blue-600 hover:underline">{p.name}</Link>
                  </td>
                  <td className="py-3 px-3">{getProjectBadge(p.status)}</td>
                  <td className="py-3 px-3 text-slate-600 font-medium">{formatDate(p.endDate)}</td>
                  <td className="py-3 px-3 text-right">
                    <Link to={`/projects/${p.id}`} className="inline-flex p-1 text-slate-400 hover:text-blue-600 transition" aria-label="View project">
                      <Eye className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ClientProjectsTable;

