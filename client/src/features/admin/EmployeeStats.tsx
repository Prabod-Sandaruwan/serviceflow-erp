import { Users, UserCheck, Shield, Briefcase } from 'lucide-react';

export function EmployeeStats({ employees = [], total }: { employees?: any[]; total?: number }) {
  const totalCount = total ?? employees.length;
  const activeCount = employees.filter((e) => e.isActive !== false).length;
  const activePct = totalCount > 0 ? Math.round((activeCount / totalCount) * 100) : 100;
  const managerCount = employees.filter((e) =>
    e.role === 'MANAGER' || e.role === 'ADMIN' || (e.jobTitle || '').toLowerCase().includes('manager'),
  ).length;
  const staffCount = employees.filter((e) =>
    e.role === 'STAFF' || (!e.role && !(e.jobTitle || '').toLowerCase().includes('manager')),
  ).length;

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6" data-purpose="employee-summary-metrics">
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">TOTAL EMPLOYEES</p>
          <div className="text-2xl font-black text-slate-900 tracking-tight mt-1">{totalCount}</div>
          <span className="text-[11px] text-slate-500 mt-1 inline-block">Registered workforce</span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <Users className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">ACTIVE STAFF</p>
          <div className="text-2xl font-black text-emerald-600 tracking-tight mt-1">{activeCount}</div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {activePct}% Active roster
          </span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <UserCheck className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">MANAGEMENT</p>
          <div className="text-2xl font-black text-indigo-600 tracking-tight mt-1">{managerCount}</div>
          <span className="text-[11px] text-slate-500 mt-1 inline-block">Admins &amp; Project Managers</span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
          <Shield className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">STAFF &amp; DELIVERY</p>
          <div className="text-2xl font-black text-slate-900 tracking-tight mt-1">{staffCount}</div>
          <span className="text-[11px] text-slate-500 mt-1 inline-block">Operations team members</span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
          <Briefcase className="w-5 h-5" />
        </div>
      </div>
    </section>
  );
}

export default EmployeeStats;
