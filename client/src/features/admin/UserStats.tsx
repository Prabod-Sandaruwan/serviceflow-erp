import { Users, CheckCircle2, ShieldCheck, UserCheck } from 'lucide-react';

export function UserStats({ users = [] }: { users?: any[] }) {
  const activeCount = users.filter((u) => u.isActive !== false).length;
  const adminCount = users.filter((u) => u.role === 'ADMIN').length;
  const managerCount = users.filter((u) => u.role === 'MANAGER').length;
  const staffCount = users.filter((u) => u.role === 'STAFF').length;

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">TOTAL ACCOUNTS</p>
          <div className="text-2xl font-black text-slate-900 tracking-tight mt-1">{users.length}</div>
          <span className="text-[11px] text-slate-500 mt-1 inline-block">Registered user profiles</span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <Users className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">ACTIVE USERS</p>
          <div className="text-2xl font-black text-emerald-600 tracking-tight mt-1">{activeCount}</div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Enabled login access
          </span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-wider text-purple-600 uppercase">ADMINISTRATORS</p>
          <div className="text-2xl font-black text-purple-700 tracking-tight mt-1">{adminCount}</div>
          <span className="text-[11px] text-slate-500 mt-1 inline-block">Full system permissions</span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">MANAGERS &amp; STAFF</p>
          <div className="text-2xl font-black text-slate-900 tracking-tight mt-1">{managerCount + staffCount}</div>
          <span className="text-[11px] text-slate-500 mt-1 inline-block">{managerCount} Managers • {staffCount} Staff</span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center shrink-0">
          <UserCheck className="w-5 h-5" />
        </div>
      </div>
    </section>
  );
}

export default UserStats;
