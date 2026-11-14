import { Pencil, Building2 } from 'lucide-react';
import type { Client } from './types';

interface ClientContactCardProps {
  client: Client;
  onEdit: () => void;
}

export function ClientContactCard({ client, onEdit }: ClientContactCardProps) {
  const contactPerson = client.contactPerson || client.displayName || 'Not provided';

  const items = [
    { label: 'EMAIL', value: client.email || 'Not provided' },
    { label: 'PHONE', value: client.phone || 'Not provided' },
    { label: 'CONTACT PERSON', value: contactPerson },
    { label: 'ADDRESS', value: client.address || 'Not provided' },
  ];

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
            <Building2 className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">Contact Details</h2>
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline transition"
        >
          <Pencil className="w-3.5 h-3.5" />
          <span>Edit Details</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((it) => (
          <div key={it.label} className="bg-slate-50/70 border border-slate-100 rounded-xl p-4 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 block">
              {it.label}
            </span>
            <span className="text-xs font-semibold text-slate-800 break-words leading-relaxed">
              {it.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ClientContactCard;

