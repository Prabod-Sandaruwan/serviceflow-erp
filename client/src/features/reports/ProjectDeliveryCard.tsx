import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import type { AdminCounts, FeaturedProjectData } from "./types";
import { FeaturedProjectCard } from "./FeaturedProjectCard";

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

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Project Velocity &amp; Resource Delivery
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Sprint throughput and task delivery health
            </p>
          </div>
          <Link
            to="/reports/projects"
            className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            View Projects <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        <FeaturedProjectCard prj={prj} done={done} totalTasks={totalTasks} />

        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-xl border border-slate-100 bg-slate-50/40 p-3">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
              Overdue
            </span>
            <p className="mt-1 text-base font-black text-emerald-600">
              {overdue}
            </p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50/40 p-3">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
              In Progress
            </span>
            <p className="mt-1 text-base font-black text-indigo-600">
              {inProgress}
            </p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50/40 p-3">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
              Done
            </span>
            <p className="mt-1 text-base font-black text-slate-900">{done}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
        <div>
          <span>Active Clients</span>:{" "}
          <span className="font-bold text-slate-700">{activeClients}</span>
          <span className="mx-1">•</span>
          <span>{totalTasks} Total Tasks</span>
        </div>
        {prj?.creatorName && (
          <span className="text-indigo-600 font-medium">
            Lead: {prj.creatorName}
          </span>
        )}
      </div>
    </div>
  );
}

export default ProjectDeliveryCard;
