import { Link } from 'react-router-dom';
import type { Lead } from './types';

const columns = [
  { id: 'NEW', title: 'New', color: 'border-blue-500 bg-blue-50/40 text-blue-700' },
  { id: 'CONTACTED', title: 'Contacted', color: 'border-cyan-500 bg-cyan-50/40 text-cyan-700' },
  { id: 'QUALIFIED', title: 'Qualified', color: 'border-purple-500 bg-purple-50/40 text-purple-700' },
  { id: 'PROPOSAL_SENT', title: 'Proposal Sent', color: 'border-amber-500 bg-amber-50/40 text-amber-700' },
  { id: 'CONVERTED', title: 'Converted', color: 'border-emerald-500 bg-emerald-50/40 text-emerald-700' },
  { id: 'LOST', title: 'Lost', color: 'border-rose-500 bg-rose-50/40 text-rose-700' },
];

export function LeadKanbanBoard({ leads }: { leads: Lead[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 overflow-x-auto pb-4">
      {columns.map((col) => {
        const colLeads = leads.filter((l) => l.status === col.id);
        const colTotal = colLeads.reduce((sum, l) => sum + (l.expectedValue || 0), 0);

        return (
          <div key={col.id} className="bg-slate-50/80 rounded-2xl p-3 border border-slate-200/60 flex flex-col min-h-[300px]">
            <div className={`flex items-center justify-between pb-2 mb-2 border-b-2 ${col.color}`}>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold">{col.title}</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white text-slate-600 shadow-xs">{colLeads.length}</span>
              </div>
              <span className="text-[10px] font-bold text-slate-500">${colTotal.toLocaleString()}</span>
            </div>

            <div className="space-y-2 flex-1 overflow-y-auto">
              {colLeads.length === 0 ? (
                <div className="text-center py-8 text-[11px] text-slate-400 font-medium">No leads</div>
              ) : (
                colLeads.map((l) => (
                  <Link
                    key={l.id}
                    to={`/leads/${l.id}`}
                    className="block bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs hover:border-blue-400 hover:shadow-md transition text-xs"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-semibold text-slate-800 line-clamp-1">{l.title || `Lead #${l.id}`}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px]">
                      <span className="font-bold text-blue-600">{l.expectedValue != null ? `$${l.expectedValue.toLocaleString()}` : '-'}</span>
                      <span className="text-slate-500 font-medium truncate max-w-[90px]">{l.owner?.fullName || l.owner?.email || `User #${l.ownerId}`}</span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default LeadKanbanBoard;

