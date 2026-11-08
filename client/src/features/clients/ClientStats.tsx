import { Users, Building2, User } from 'lucide-react';
import type { Client } from './types';

export function ClientStats({ clients, total }: { clients?: Client[]; total?: number }) {
  const list = clients || [];
  const totalCount = total ?? list.length;
  const activeCount = list.filter((c) => c.isActive).length;
  const activePct = list.length > 0 ? Math.round((activeCount / list.length) * 100) : 100;
  const corporateCount = list.filter((c) => c.clientType === 'COMPANY' || c.clientType === 'BUSINESS').length;
  const individualCount = list.filter((c) => c.clientType === 'INDIVIDUAL').length;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {/* 1. Total Clients */}
      <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
        <div>
          <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400">Total Clients</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 tracking-tight">{totalCount}</span>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">{activePct}% Active</span>
          </div>
        </div>
        <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600"><Users className="h-5 w-5" /></div>
      </div>

      {/* 2. Corporate */}
      <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
        <div>
          <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400">Corporate</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 tracking-tight">{corporateCount}</span>
            <span className="text-xs font-medium text-slate-500">Companies</span>
          </div>
        </div>
        <div className="rounded-xl bg-purple-50 p-2.5 text-purple-600"><Building2 className="h-5 w-5" /></div>
      </div>

      {/* 3. Individuals */}
      <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
        <div>
          <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400">Individuals</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 tracking-tight">{individualCount}</span>
            <span className="text-xs font-medium text-slate-500">Retail / Student</span>
          </div>
        </div>
        <div className="rounded-xl bg-cyan-50 p-2.5 text-cyan-600"><User className="h-5 w-5" /></div>
      </div>
    </div>
  );
}

export default ClientStats;
