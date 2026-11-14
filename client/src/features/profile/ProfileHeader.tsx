import type { User } from '../auth/types';

interface ProfileHeaderProps {
  user: User | null;
  fullName: string;
  initials: string;
}

export function ProfileHeader({ user, fullName, initials }: ProfileHeaderProps) {
  const isUnset = fullName === 'Not specified';
  const roleLabel = user?.role === 'ADMIN'
    ? 'Active System Administrator'
    : user?.role === 'MANAGER'
      ? 'Active Manager'
      : 'Active Staff';

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
      <div className="flex items-center space-x-4">
        <div className="relative group cursor-pointer" title="Change Avatar">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-500 text-white font-heading font-bold text-xl flex items-center justify-center shadow-lg shadow-indigo-500/25 ring-4 ring-indigo-50">
            {initials}
          </div>
          <div className="absolute bottom-0 right-0 w-5 h-5 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-600 shadow-sm">
            <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-bold font-heading text-slate-900 leading-tight">
              {fullName}
            </h2>
            {isUnset && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium inline-flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
                Unset Name
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-slate-600 font-medium">{user?.email}</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <svg className="w-3 h-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" clipRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
              </svg>
              Verified
            </span>
          </div>
        </div>
      </div>

      <div className="sm:text-right text-left flex sm:flex-col items-center sm:items-end gap-2 sm:gap-1 text-xs">
        <span className="text-slate-400 text-[11px] uppercase tracking-wider font-semibold">Account Status</span>
        <div className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
          {roleLabel}
        </div>
      </div>
    </div>
  );
}
