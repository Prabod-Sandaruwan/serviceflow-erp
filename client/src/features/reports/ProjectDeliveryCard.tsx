import { ArrowUpRight } from 'lucide-react';
import type { AdminCounts } from './types';

export function ProjectDeliveryCard({ c }: { c?: AdminCounts | null }) {
  const overdue = c?.tasks?.overdue ?? 0;
  const inProgress = c?.tasks?.inProgress ?? 1;
  const done = c?.tasks?.done ?? 16;
  const activeClients = c?.activeClients ?? 15;

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Project Velocity &amp; Resource Delivery</h3>
            <p className="mt-1 text-xs text-slate-500">Sprint throughput, milestone pace, and task delivery health</p>
          </div>
          <a href="/reports/projects" className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50">
            View Projects <ArrowUpRight className="h-3 w-3" />
          </a>
        </div>

        {/* Featured Project Card */}
        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-2">
              <span className="font-bold text-indigo-600">PRJ-2028-09</span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-800">On Schedule</span>
            </div>
            <span className="text-slate-400">Delivery Target Dec 15, 2026</span>
          </div>
          <h4 className="mt-2 text-sm font-bold text-slate-900">Fintech Core Banking API Integration</h4>
          <p className="text-xs text-slate-500">Colombo Global Merchant Bank PLC</p>

          <div className="mt-3">
            <div className="flex justify-between text-[10px] font-semibold text-slate-600">
              <span>Milestone Progress (8 Total Sprints)</span>
              <span className="text-indigo-600">7 / 8 Completed (87.5%)</span>
            </div>
            <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-200">
              <div className="h-1.5 rounded-full bg-indigo-600" style={{ width: '87.5%' }} />
            </div>
          </div>
        </div>

        {/* 3 Metric Mini Cards */}
        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-xl border border-slate-100 bg-slate-50/40 p-3">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Overdue Tasks</span>
            <p className="mt-1 text-base font-black text-emerald-600">{overdue}</p>
            <span className="text-[9px] text-slate-400">Zero backlog</span>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50/40 p-3">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">In Progress</span>
            <p className="mt-1 text-base font-black text-indigo-600">{inProgress}</p>
            <span className="text-[9px] text-slate-400">UAT Validation</span>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50/40 p-3">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Done &amp; Verified</span>
            <p className="mt-1 text-base font-black text-slate-900">{done}</p>
            <span className="text-[9px] text-slate-400">94.1% Rate</span>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
        <div>
          <span>Active Accounts: </span>
          <span>Active Clients</span>: <span className="font-bold text-slate-700">{activeClients}</span>
          <span className="mx-1">•</span>
          <span>{c?.tasks?.total ?? 17} Tasks</span>
        </div>
        <span className="text-indigo-600 font-medium">Lead: manager1@serviceflow.lk</span>
      </div>
    </div>
  );
}

export default ProjectDeliveryCard;
