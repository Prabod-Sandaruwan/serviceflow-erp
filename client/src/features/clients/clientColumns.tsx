import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { ClientActionMenu } from './ClientActionMenu';
import type { Column } from '../../components/ui/Table';
import type { Client } from './types';

export const getClientColumns = (): Column<Client>[] => [
  {
    key: 'displayName', label: 'NAME',
    render: (c) => (
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-50 font-bold text-xs text-blue-700">
          {c.displayName.slice(0, 2).toUpperCase()}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-bold text-slate-900 text-xs truncate">{c.displayName}</span>
          <span className="text-[10px] text-slate-400 font-medium truncate">{c.contactPerson ? `${c.contactPerson} • ` : ''}#CLI-{c.id.slice(-4)}</span>
        </div>
      </div>
    ),
  },
  {
    key: 'clientType', label: 'TYPE',
    render: (c) => (
      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
        c.clientType === 'INDIVIDUAL' ? 'bg-cyan-50 text-cyan-700 border border-cyan-200/50' : 'bg-indigo-50 text-indigo-700 border border-indigo-200/50'
      }`}>{c.clientType}</span>
    ),
  },
  {
    key: 'email', label: 'EMAIL',
    render: (c) => c.email ? (
      <span className="flex items-center gap-1.5 text-xs text-slate-600"><Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" /><span className="truncate">{c.email}</span></span>
    ) : <span className="italic text-xs text-slate-400">Not provided</span>,
  },
  { key: 'phone', label: 'PHONE', render: (c) => <span className="text-xs text-slate-600 font-medium">{c.phone || '—'}</span> },
  {
    key: 'isActive', label: 'STATUS',
    render: (c) => (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
        c.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' : 'bg-slate-100 text-slate-600 border border-slate-200'
      }`}>
        <span className={`h-1.5 w-1.5 rounded-full ${c.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
        {c.isActive ? 'Active' : 'Inactive'}
      </span>
    ),
  },
  {
    key: 'actions', label: 'ACTIONS',
    render: (c) => (
      <div className="flex items-center gap-2">
        <Link to={`/clients/${c.id}`} className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold text-blue-600 bg-blue-50/70 hover:bg-blue-100 border border-blue-200/50 transition">View</Link>
        <ClientActionMenu client={c} />
      </div>
    ),
  },
];
