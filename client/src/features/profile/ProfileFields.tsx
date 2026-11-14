import type { User } from '../auth/types';

interface ProfileFieldsProps {
  user: User | null;
  fullName: string;
  onEditName: () => void;
}

export function ProfileFields({ user, fullName, onEditName }: ProfileFieldsProps) {
  const role = user?.role || 'STAFF';
  const phone = user?.employee?.phone || (user?.employee as any)?.phone || 'Not provided';
  const jobTitle = user?.employee?.jobTitle || (user?.employee as any)?.job_title || user?.employee?.position || 'Staff Member';
  const dept = user?.employee?.department || 'Operations';
  const roleDesc = role === 'ADMIN'
    ? 'Full administrative access across all organizational units, financial records, and user management.'
    : role === 'MANAGER'
      ? 'Operational and managerial access across projects, clients, sales pipelines, and teams.'
      : 'Standard staff access for day-to-day task execution and assigned operational workflows.';

  return (
    <div className="space-y-3.5">
      <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 hover:border-slate-300 transition-colors group">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
          <button onClick={onEditName} className="text-xs text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <span>Edit</span>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>
          </button>
        </div>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-base font-semibold text-slate-900">{fullName}</span>
          <span className="text-xs text-slate-400 italic">{fullName === 'Not specified' ? 'Click edit to add full legal name' : 'Verified legal name'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 hover:border-slate-300 transition-colors">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
          <div className="mt-1 text-sm font-semibold text-slate-900 truncate">{user?.email}</div>
        </div>
        <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 hover:border-slate-300 transition-colors group">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Phone &amp; Designation</label>
            <button onClick={onEditName} className="text-xs text-blue-600 hover:text-blue-700 font-medium opacity-0 group-hover:opacity-100 transition-opacity">Edit</button>
          </div>
          <div className="mt-1 text-sm font-semibold text-slate-900">{phone} • <span className="text-slate-600 font-normal">{jobTitle} ({dept})</span></div>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 hover:border-slate-300 transition-colors">
        <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Role &amp; Permissions</label>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-bold bg-indigo-100/90 text-indigo-800 border border-indigo-200">{role}</span>
          <span className="text-xs text-slate-500 font-medium">{roleDesc}</span>
        </div>
      </div>
    </div>
  );
}
