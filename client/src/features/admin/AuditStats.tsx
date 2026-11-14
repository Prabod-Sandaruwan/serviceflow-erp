import { Activity, Lock, ShieldCheck, Database } from 'lucide-react';

export function AuditStats({ logs = [], total }: { logs?: any[]; total?: number }) {
  const totalCount = total ?? logs.length;
  const authCount = logs.filter((l) =>
    (l.action || '').includes('LOGIN') || (l.action || '').includes('PASSWORD') || (l.action || '').includes('AUTH'),
  ).length;
  const financialCount = logs.filter((l) =>
    (l.action || '').includes('INVOICE') || (l.action || '').includes('PAYMENT') || (l.action || '').includes('EXPENSE'),
  ).length;
  const entityCount = logs.filter((l) =>
    (l.action || '').includes('PROJECT') || (l.action || '').includes('TASK') || (l.action || '').includes('LEAD') || (l.action || '').includes('CLIENT'),
  ).length;

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6" data-purpose="audit-summary-metrics">
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">TOTAL AUDIT EVENTS</p>
          <div className="text-2xl font-black text-slate-900 tracking-tight mt-1">{totalCount}</div>
          <span className="text-[11px] text-slate-500 mt-1 inline-block">Immutable activity log</span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <Activity className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">SECURITY &amp; ACCESS</p>
          <div className="text-2xl font-black text-indigo-600 tracking-tight mt-1">{authCount}</div>
          <span className="text-[11px] text-slate-500 mt-1 inline-block">Auth, sessions &amp; keys</span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
          <Lock className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">FINANCIAL ACTIONS</p>
          <div className="text-2xl font-black text-emerald-600 tracking-tight mt-1">{financialCount}</div>
          <span className="text-[11px] text-slate-500 mt-1 inline-block">Invoices, payments &amp; costs</span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">ENTITY MUTATIONS</p>
          <div className="text-2xl font-black text-amber-600 tracking-tight mt-1">{entityCount}</div>
          <span className="text-[11px] text-slate-500 mt-1 inline-block">Projects, tasks &amp; CRM</span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
          <Database className="w-5 h-5" />
        </div>
      </div>
    </section>
  );
}

export default AuditStats;

