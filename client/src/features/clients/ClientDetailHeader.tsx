import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useUpdateClient } from './clientMutations';
import { useToast } from '../../components/ui/Toast';
import type { Client } from './types';

function getInitials(name?: string) {
  if (!name) return 'CL';
  const p = name.trim().split(/\s+/);
  return (p.length >= 2 ? `${p[0][0]}${p[1][0]}` : name.slice(0, 2)).toUpperCase();
}

function formatDate(ds?: string) {
  if (!ds) return 'Nov 04, 2025';
  try {
    const d = new Date(ds);
    return isNaN(d.getTime()) ? 'Nov 04, 2025' : d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  } catch { return 'Nov 04, 2025'; }
}

export function ClientDetailHeader({ client }: { client: Client }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { mutate: updateClient, isPending } = useUpdateClient();
  const { addToast } = useToast();

  const handleToggle = () => {
    updateClient({ id: client.id, isActive: !client.isActive }, {
      onSuccess: () => {
        addToast(client.isActive ? 'Client marked as inactive' : 'Client marked as active', 'success');
        setConfirmOpen(false);
      },
    });
  };

  const code = client.registrationNumber?.startsWith('#CLI-')
    ? client.registrationNumber
    : `#CLI-${String(client.id).padStart(3, '0')}`;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl tracking-tight shadow-sm shrink-0">
          {getInitials(client.displayName)}
        </div>
        <div>
          <div className="flex items-center flex-wrap gap-2 mb-1">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">{client.displayName}</h1>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold ${
              client.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}>
              {client.isActive ? 'Active' : 'Inactive'}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
              {client.clientType === 'INDIVIDUAL' ? 'Individual' : 'Company'}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200/80 font-mono">
              {code}
            </span>
          </div>
          <p className="text-xs text-slate-500">Client record created on {formatDate(client.createdAt)}</p>
        </div>
      </div>
      <div className="relative self-start sm:self-center">
        <button
          type="button"
          onClick={() => setConfirmOpen(!confirmOpen)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50/50 transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete</span>
        </button>
        {confirmOpen && (
          <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-white border border-slate-200 rounded-xl shadow-xl z-50 text-xs">
            <p className="text-slate-700 font-medium mb-2">Mark client as inactive?</p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setConfirmOpen(false)} className="px-2.5 py-1 text-slate-500 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button type="button" disabled={isPending} onClick={handleToggle} className="px-2.5 py-1 bg-rose-600 text-white font-medium rounded-lg hover:bg-rose-700">Confirm</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ClientDetailHeader;
