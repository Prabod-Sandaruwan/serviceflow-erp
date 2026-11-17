import { FolderKanban } from "lucide-react";
import type { FeaturedProjectData } from "./types";

const BADGES: Record<string, { label: string; bg: string }> = {
  CRITICAL: { label: "Critical", bg: "bg-rose-100 text-rose-800" },
  AT_RISK: { label: "At Risk", bg: "bg-amber-100 text-amber-800" },
  ON_TRACK: { label: "On Schedule", bg: "bg-emerald-100 text-emerald-800" },
};

export function FeaturedProjectCard({
  prj,
  done,
  totalTasks,
}: {
  prj?: FeaturedProjectData | null;
  done: number;
  totalTasks: number;
}) {
  const badge = (prj?.health && BADGES[prj.health]) || BADGES.ON_TRACK;

  if (!prj) {
    return (
      <div className="mt-5 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
        <FolderKanban className="h-8 w-8 text-slate-300" />
        <p className="mt-2 text-xs font-semibold text-slate-700">
          No active projects currently in sprint
        </p>
        <p className="mt-0.5 text-[11px] text-slate-400">
          Create a project or activate tasks to see live velocity.
        </p>
      </div>
    );
  }

  const code = prj.code || (prj as any).projectCode;
  const pct = totalTasks > 0 ? Math.round((done / totalTasks) * 100) : 0;

  return (
    <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
      <div className="flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-2">
          <span className="font-bold text-indigo-600">{code}</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${badge.bg}`}
          >
            {badge.label}
          </span>
        </div>
        <span className="text-slate-400">
          Budget: ${Number(prj.budget ?? 0).toLocaleString()}
        </span>
      </div>
      <h4 className="mt-2 text-sm font-bold text-slate-900">{prj.name}</h4>
      <p className="text-xs text-slate-500">
        {prj.clientName || "General Client"}
      </p>
      <div className="mt-3">
        <div className="flex justify-between text-[10px] font-semibold text-slate-600">
          <span>Task Throughput</span>
          <span className="text-indigo-600">
            {done} / {totalTasks} Completed
          </span>
        </div>
        <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-200">
          <div
            className="h-1.5 rounded-full bg-indigo-600"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
