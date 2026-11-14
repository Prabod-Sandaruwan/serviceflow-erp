import { useTaskStats } from './taskStatsHook';
import type { Task } from './types';

export function TaskStats({ fallbackTasks }: { fallbackTasks?: Task[] }) {
  const { data } = useTaskStats();
  const raw: any = data?.data;
  const apiStats = raw && typeof raw.todo === 'number' ? raw : raw?.data;

  const fallback = (fallbackTasks || []).reduce(
    (acc, t) => {
      acc.total += 1;
      if (t.status === 'TODO') acc.todo += 1;
      else if (t.status === 'IN_PROGRESS') acc.inProgress += 1;
      else if (t.status === 'DONE') acc.done += 1;
      else if (t.status === 'CANCELLED') acc.cancelled += 1;
      return acc;
    },
    { todo: 0, inProgress: 0, done: 0, cancelled: 0, total: 0 },
  );

  const stats = apiStats || fallback;

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6" data-purpose="tasks-summary-metrics">
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between hover:border-blue-200 transition-all">
        <div>
          <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">To Do</p>
          <div className="text-2xl font-bold text-slate-900 mt-1">{stats.todo}</div>
          <span className="inline-flex items-center text-[11px] font-medium text-blue-600 mt-1">Pending assignment &amp; start</span>
        </div>
        <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between hover:border-amber-200 transition-all">
        <div>
          <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">In Progress</p>
          <div className="text-2xl font-bold text-slate-900 mt-1">{stats.inProgress}</div>
          <span className="inline-flex items-center text-[11px] font-medium text-amber-700 mt-1">In active development</span>
        </div>
        <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between hover:border-emerald-200 transition-all">
        <div>
          <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">Done</p>
          <div className="text-2xl font-bold text-slate-900 mt-1">{stats.done}</div>
          <span className="inline-flex items-center text-[11px] font-semibold text-emerald-600 mt-1">Completed &amp; verified</span>
        </div>
        <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between hover:border-slate-300 transition-all">
        <div>
          <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">Cancelled</p>
          <div className="text-2xl font-bold text-slate-900 mt-1">{stats.cancelled}</div>
          <span className="inline-flex items-center text-[11px] font-medium text-slate-400 mt-1">Discarded / halted</span>
        </div>
        <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
        </div>
      </div>
    </section>
  );
}

export default TaskStats;

