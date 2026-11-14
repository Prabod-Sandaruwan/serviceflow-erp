import { Calendar, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { FollowUp } from '../leads/types';

export function FollowUpStats({ followUps = [] }: { followUps?: FollowUp[] }) {
  const pending = followUps.filter((f) => f.status === 'PENDING');
  const overdue = followUps.filter((f) => f.isOverdue && f.status === 'PENDING');
  const done = followUps.filter((f) => f.status === 'DONE');

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">TOTAL SCHEDULED</p>
          <div className="text-2xl font-black text-slate-900 tracking-tight mt-1">{followUps.length}</div>
          <span className="text-[11px] text-slate-500 mt-1 inline-block">Client pipeline interactions</span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <Calendar className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">PENDING ACTIONS</p>
          <div className="text-2xl font-black text-amber-600 tracking-tight mt-1">{pending.length}</div>
          <span className="text-[11px] text-slate-500 mt-1 inline-block">Calls, meetings &amp; follow-ups</span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
          <Clock className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-wider text-rose-500 uppercase">CRITICAL OVERDUE</p>
          <div className="text-2xl font-black text-rose-600 tracking-tight mt-1">{overdue.length}</div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-rose-600 mt-1">
            Immediate client outreach
          </span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-wider text-emerald-700 uppercase">COMPLETED</p>
          <div className="text-2xl font-black text-emerald-600 tracking-tight mt-1">{done.length}</div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-block">Concluded engagements</span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-5 h-5" />
        </div>
      </div>
    </section>
  );
}

export default FollowUpStats;
