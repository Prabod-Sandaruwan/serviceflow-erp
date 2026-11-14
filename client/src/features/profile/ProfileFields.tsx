import type { User } from '../auth/types';

interface ProfileFieldsProps {
  user: User | null;
  fullName: string;
  onEditName: () => void;
}

export function ProfileFields({ user, fullName, onEditName }: ProfileFieldsProps) {
  const isUnset = fullName === 'Not specified';
  const role = user?.role || 'STAFF';
  const roleDesc = role === 'ADMIN'
    ? 'Full administrative access across all organizational units, financial records, and user management.'
    : role === 'MANAGER'
      ? 'Operational and managerial access across projects, clients, sales pipelines, and teams.'
      : 'Standard staff access for day-to-day task execution and assigned operational workflows.';

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 hover:border-slate-300 transition-colors group">
        <div className="flex items-center justify-between">
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider font-sans">Full Name</label>
          <button onClick={onEditName} className="text-xs text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <span>Edit</span>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </button>
        </div>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-base font-semibold text-slate-900 tracking-normal">{fullName}</span>
          <span className="text-xs text-slate-400 italic font-normal">
            {isUnset ? 'Click edit to add full legal name' : 'Verified legal name'}
          </span>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 hover:border-slate-300 transition-colors group">
        <div className="flex items-center justify-between">
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider font-sans">Email Address</label>
          <span className="text-[11px] text-slate-400 font-medium">Primary Enterprise Account</span>
        </div>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-base font-semibold text-slate-900 tracking-normal font-sans">{user?.email}</span>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium text-slate-600 bg-white border border-slate-200 shadow-2xs">
            <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
            Direct Deliverable
          </span>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 hover:border-slate-300 transition-colors">
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider font-sans">Role &amp; Permissions</label>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-bold bg-indigo-100/90 text-indigo-800 tracking-wide border border-indigo-200">
            {role}
          </span>
          <span className="text-xs text-slate-500 font-medium ml-1">{roleDesc}</span>
        </div>
      </div>
    </div>
  );
}
