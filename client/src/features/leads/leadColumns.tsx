import { Link } from 'react-router-dom';
import type { Column } from '../../components/ui/Table';
import type { Lead } from './types';
import { LeadActionMenu } from './LeadActionMenu';

const statusConfig: Record<string, { label: string; dot: string; pill: string }> = {
  LOST: { label: 'Lost', dot: 'bg-rose-500', pill: 'bg-rose-50 text-rose-700 border-rose-200' },
  CONVERTED: { label: 'Converted', dot: 'bg-emerald-500', pill: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  WON: { label: 'Won', dot: 'bg-emerald-500', pill: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  QUALIFIED: { label: 'Qualified', dot: 'bg-purple-500', pill: 'bg-purple-50 text-purple-700 border-purple-200' },
  PROPOSAL_SENT: { label: 'Proposal Sent', dot: 'bg-amber-500', pill: 'bg-amber-50 text-amber-700 border-amber-200' },
  CONTACTED: { label: 'Contacted', dot: 'bg-cyan-500', pill: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  NEW: { label: 'New', dot: 'bg-blue-500', pill: 'bg-blue-50 text-blue-700 border-blue-200' },
};

function getAvatar(l: Lead) {
  if (l.convertedClientId) {
    const code = `C${String(l.convertedClientId).slice(-1)}`;
    return { initials: code, bg: 'bg-blue-50 text-blue-700 border-blue-200', name: `Client #${l.convertedClientId}` };
  }
  const name = l.owner?.fullName || l.owner?.email || `User #${l.ownerId}`;
  const parts = name.trim().split(/\s+/);
  const initials = parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}`.toUpperCase() : name.slice(0, 2).toUpperCase();
  return { initials, bg: 'bg-slate-100 text-slate-700 border-slate-200', name };
}

export function getLeadColumns(): Column<Lead>[] {
  return [
    {
      key: 'title', label: 'Title',
      render: (l) => {
        const conf = statusConfig[l.status] || statusConfig.NEW;
        return (
          <div className="flex items-center gap-2 font-medium text-slate-800">
            <span className={`w-2 h-2 rounded-full ${conf.dot}`} />
            <span>{l.title || `Lead #${l.id}`}</span>
          </div>
        );
      },
    },
    {
      key: 'client', label: 'Client / Owner',
      render: (l) => {
        const av = getAvatar(l);
        return (
          <div className="flex items-center gap-2 text-xs">
            <span className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-[10px] border ${av.bg}`}>{av.initials}</span>
            <span className="font-medium text-slate-700">{av.name}</span>
          </div>
        );
      },
    },
    {
      key: 'expectedValue', label: 'Value',
      render: (l) => <span className="font-bold text-slate-900">{l.expectedValue != null ? `$${l.expectedValue.toLocaleString()}` : '-'}</span>,
    },
    {
      key: 'status', label: 'Status',
      render: (l) => {
        const conf = statusConfig[l.status] || statusConfig.NEW;
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${conf.pill}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${conf.dot}`} />
            <span>{conf.label}</span>
          </span>
        );
      },
    },
    {
      key: 'actions', label: 'Actions',
      render: (l) => (
        <div className="flex items-center justify-end gap-1">
          <Link to={`/leads/${l.id}`} className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition">View</Link>
          <LeadActionMenu lead={l} />
        </div>
      ),
    },
  ];
}

export default getLeadColumns;

