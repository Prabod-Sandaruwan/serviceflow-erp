import { Link } from 'react-router-dom';
import { Check, ExternalLink } from 'lucide-react';
import type { FollowUp } from '../leads/types';

interface FollowUpTableProps {
  followUps: FollowUp[];
  onMarkDone: (id: string) => void;
  isPendingDone?: boolean;
}

export function FollowUpTable({ followUps, onMarkDone, isPendingDone = false }: FollowUpTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200/80 bg-white shadow-2xs">
      <table className="min-w-full divide-y divide-slate-200/80 text-left text-xs">
        <thead className="bg-slate-50/75 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          <tr>
            <th className="px-4 py-3.5">Lead Reference</th>
            <th className="px-4 py-3.5">Scheduled Date &amp; Time</th>
            <th className="px-4 py-3.5">Notes &amp; Interaction Goal</th>
            <th className="px-4 py-3.5">Status</th>
            <th className="px-4 py-3.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200/70 bg-white text-slate-900">
          {followUps.map((f) => {
            const isPending = f.status === 'PENDING';
            const isOverdue = f.isOverdue && isPending;
            return (
              <tr key={f.id} className="hover:bg-slate-50/50 transition">
                <td className="whitespace-nowrap px-4 py-3.5 font-bold text-blue-600">
                  <Link to={`/leads/${f.leadId}`} className="hover:underline flex items-center gap-1">
                    Lead #{f.leadId}
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </Link>
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 font-medium text-slate-700">
                  {f.scheduledAt ? new Date(f.scheduledAt).toLocaleString() : '—'}
                </td>
                <td className="px-4 py-3.5 text-slate-800 max-w-sm">
                  <div className="line-clamp-2">{f.notes || <span className="text-slate-400 italic">No notes provided</span>}</div>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${isPending ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                      {isPending ? 'Pending' : 'Completed'}
                    </span>
                    {isOverdue && (
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        Overdue
                      </span>
                    )}
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-3.5 text-right">
                  {isPending && (
                    <button
                      type="button"
                      disabled={isPendingDone}
                      onClick={() => onMarkDone(f.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition cursor-pointer"
                    >
                      <Check className="w-3 h-3" />
                      Mark Done
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default FollowUpTable;
