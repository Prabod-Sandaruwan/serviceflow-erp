import { FolderKanban, CheckCircle2, Clock, CheckCheck } from 'lucide-react';
import type { Project } from './types';

export function ProjectStats({ projects = [] }: { projects?: Project[] }) {
  const activeCount = projects.filter((p) => p.status === 'ACTIVE').length;
  const plannedCount = projects.filter((p) => p.status === 'PLANNED').length;
  const completedCount = projects.filter((p) => p.status === 'COMPLETED').length;

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">TOTAL PROJECTS</p>
          <div className="text-2xl font-black text-slate-900 tracking-tight mt-1">{projects.length}</div>
          <span className="text-[11px] text-slate-500 mt-1 inline-block">Portfolio delivery pipeline</span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <FolderKanban className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">ACTIVE DELIVERY</p>
          <div className="text-2xl font-black text-emerald-600 tracking-tight mt-1">{activeCount}</div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />In active progress
          </span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">IN PLANNING</p>
          <div className="text-2xl font-black text-amber-600 tracking-tight mt-1">{plannedCount}</div>
          <span className="text-[11px] text-slate-500 mt-1 inline-block">Awaiting activation</span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
          <Clock className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">COMPLETED</p>
          <div className="text-2xl font-black text-slate-900 tracking-tight mt-1">{completedCount}</div>
          <span className="text-[11px] text-slate-500 mt-1 inline-block">100% finished deliverables</span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center shrink-0">
          <CheckCheck className="w-5 h-5" />
        </div>
      </div>
    </section>
  );
}

export default ProjectStats;
