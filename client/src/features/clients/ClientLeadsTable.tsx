import { Link } from 'react-router-dom';
import { Filter, Eye, Plus } from 'lucide-react';
import type { Lead } from '../leads/types';

interface ClientLeadsTableProps {
  leads: Lead[];
  clientId: string;
}

const formatCurrency = (val?: number | null) =>
  val != null ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val) : '$0.00';

const getStatusBadge = (status: string) => {
  const isConverted = status === 'CONVERTED' || status === 'WON';
  return (
    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-md border ${
      isConverted ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'
    }`}>
      {status === 'CONVERTED' ? 'Converted' : status}
    </span>
  );
};

export function ClientLeadsTable({ leads, clientId }: ClientLeadsTableProps) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600"><Filter className="w-4 h-4" /></div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">Leads</h2>
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">{leads.length}</span>
        </div>
        <Link to={`/leads/new?clientId=${clientId}`} className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700">
          <Plus className="w-3.5 h-3.5" />
          <span>Add Lead</span>
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              <th className="py-2.5 px-3">Lead ID</th>
              <th className="py-2.5 px-3">Title / Scope</th>
              <th className="py-2.5 px-3">Value</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {leads.length === 0 ? (
              <tr><td colSpan={5} className="py-6 text-center text-slate-400 font-medium">No associated leads found</td></tr>
            ) : (
              leads.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-3 font-semibold text-blue-600">
                    <Link to={`/leads/${l.id}`} className="hover:underline">#{l.id}</Link>
                  </td>
                  <td className="py-3 px-3 text-slate-700 font-medium">{l.title || `Lead #${l.id}`}</td>
                  <td className="py-3 px-3 font-semibold text-slate-800">{formatCurrency(l.expectedValue)}</td>
                  <td className="py-3 px-3">{getStatusBadge(l.status)}</td>
                  <td className="py-3 px-3 text-right">
                    <Link to={`/leads/${l.id}`} className="inline-flex p-1 text-slate-400 hover:text-blue-600 transition" aria-label="View lead">
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

export default ClientLeadsTable;
