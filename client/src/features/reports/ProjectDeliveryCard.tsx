import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import type { AdminCounts, FeaturedProjectData } from './types';

const BADGES = {
  CRITICAL: { label: 'Critical', bg: 'bg-rose-100 text-rose-800' },
  AT_RISK: { label: 'At Risk', bg: 'bg-amber-100 text-amber-800' },
  ON_TRACK: { label: 'On Schedule', bg: 'bg-emerald-100 text-emerald-800' },
};

export function ProjectDeliveryCard({
  c,
  featuredProject: prj,
}: {
  c?: AdminCounts | null;
  featuredProject?: FeaturedProjectData | null;
}) {
  const overdue = c?.tasks?.overdue ?? 0;
  const inProgress = c?.tasks?.inProgress ?? 0;
  const done = c?.tasks?.done ?? 0;
  const activeClients = c?.activeClients ?? 0;
  const totalTasks = c?.tasks?.total ?? overdue + inProgress + done;
  const code = prj?.code ?? 'PRJ-2028-09';
  const name = prj?.name ?? 'Fintech Core Banking API Integration';
  const client = prj?.clientName ?? 'Colombo Global Merchant Bank PLC';
  const lead = prj?.creatorName ?? 'manager1@serviceflow.lk';
  const badge = BADGES[prj?.health ?? 'ON_TRACK'] || BADGES.ON_TRACK;

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Project Velocity &amp; Resource Delivery</h3>
            <p className="mt-1 text-xs text-slate-500">Sprint throughput and task delivery health</p>
          </div>
          <Link to="/reports/projects" className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50">
            View Projects <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2">
              <span className="font-bold text-indigo-600">{code}</span>
              <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${badge.bg}`}>{badge.label}</span>
            </div>
            <span className="text-slate-400">Budget: ${Number(prj?.budget ?? 50000).toLocaleString()}</span>
          </div>
          <h4 className="mt-2 text-sm font-bold text-slate-900">{name}</h4>
          <p className="text-xs text-slate-500">{client}</p>

          <div className="mt-3">
            <div className="flex justify-between text-[10px] font-semibold text-slate-600">
              <span>Task Throughput</span>
              <span className="text-indigo-600">{done} / {totalTasks} Completed</span>
            </div>
            <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-200">
              <div className="h-1.5 rounded-full bg-indigo-600" style={{ width: `${totalTasks > 0 ? Math.round((done / totalTasks) * 100) : 0}%` }} />
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-xl border border-slate-100 bg-slate-50/40 p-3">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Overdue Tasks</span>
            <p className="mt-1 text-base font-black text-emerald-600">{overdue}</p>
            <span className="text-[9px] text-slate-400">Backlog items</span>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50/40 p-3">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">In Progress</span>
            <p className="mt-1 text-base font-black text-indigo-600">{inProgress}</p>
            <span className="text-[9px] text-slate-400">Active WIP</span>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50/40 p-3">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Done &amp; Verified</span>
            <p className="mt-1 text-base font-black text-slate-900">{done}</p>
            <span className="text-[9px] text-slate-400">Completed</span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
        <div>
          <span>Active Clients</span>: <span className="font-bold text-slate-700">{activeClients}</span>
          <span className="mx-1">•</span>
          <span>{totalTasks} Total Tasks</span>
        </div>
        <span className="text-indigo-600 font-medium">Lead: {lead}</span>
      </div>
    </div>
  );
}

export default ProjectDeliveryCard;
