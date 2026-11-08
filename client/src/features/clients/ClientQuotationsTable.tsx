import { Link } from 'react-router-dom';
import { FileText, Eye, Plus } from 'lucide-react';
import type { Quotation } from '../quotations/types';

interface ClientQuotationsTableProps {
  quotations: Quotation[];
  clientId: string;
}

const formatCurrency = (val?: number | string | null) =>
  val != null ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(val)) : '$0.00';

const formatDate = (ds?: string) => {
  if (!ds) return '-';
  try {
    const d = new Date(ds);
    return isNaN(d.getTime()) ? '-' : d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  } catch { return '-'; }
};

const getQuoteBadge = (status: string) => {
  const isApproved = status === 'APPROVED' || status === 'ACCEPTED';
  const isPending = status === 'SUBMITTED' || status === 'SENT';
  const color = isApproved
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : isPending
      ? 'bg-amber-50 text-amber-700 border-amber-200'
      : 'bg-slate-100 text-slate-700 border-slate-200';
  return (
    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-md border ${color}`}>
      {status === 'APPROVED' ? 'Approved' : isPending ? 'Pending' : status}
    </span>
  );
};

export function ClientQuotationsTable({ quotations, clientId }: ClientQuotationsTableProps) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600"><FileText className="w-4 h-4" /></div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">Quotations</h2>
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">{quotations.length}</span>
        </div>
        <Link to={`/quotations/new?clientId=${clientId}`} className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700">
          <Plus className="w-3.5 h-3.5" />
          <span>New Quotation</span>
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              <th className="py-2.5 px-3">Quote #</th>
              <th className="py-2.5 px-3">Date</th>
              <th className="py-2.5 px-3">Amount</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {quotations.length === 0 ? (
              <tr><td colSpan={5} className="py-6 text-center text-slate-400 font-medium">No associated quotations found</td></tr>
            ) : (
              quotations.map((q) => (
                <tr key={q.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-3 font-semibold text-blue-600">
                    <Link to={`/quotations/${q.id}`} className="hover:underline">#{q.quotationNumber}</Link>
                  </td>
                  <td className="py-3 px-3 text-slate-600 font-medium">{formatDate(q.quotationDate)}</td>
                  <td className="py-3 px-3 font-semibold text-slate-800">{formatCurrency(q.total)}</td>
                  <td className="py-3 px-3">{getQuoteBadge(q.status)}</td>
                  <td className="py-3 px-3 text-right">
                    <Link to={`/quotations/${q.id}`} className="inline-flex p-1 text-slate-400 hover:text-blue-600 transition" aria-label="View quotation">
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

export default ClientQuotationsTable;
