import { Link } from 'react-router-dom';
import type { User } from '../auth/types';

interface ProfileSecurityBarProps {
  user: User | null;
}

export function ProfileSecurityBar({ user }: ProfileSecurityBarProps) {
  const accountId = user?.id ? `USR-${String(user.id).padStart(5, '0')}` : 'USR-00001';
  const createdAtFormatted = (user as any)?.created_at || (user as any)?.createdAt
    ? new Date((user as any).created_at || (user as any).createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      })
    : 'Oct 02, 2023';

  return (
    <>
      <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" data-purpose="security-actions">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Security Credentials</h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Password was last changed on <span className="font-medium text-slate-700">January 14, 2025</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs bg-slate-100 text-slate-600 border border-slate-200">
            <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
            <span>2FA: Enabled</span>
          </div>
          <Link
            to="/profile/password"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition shadow-md shadow-indigo-600/30 hover:shadow-indigo-600/40"
          >
            <svg className="w-4 h-4 text-indigo-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
            <span>Change Password</span>
          </Link>
        </div>
      </div>

      <div className="bg-slate-50/70 border-t border-slate-100 -mx-6 md:-mx-8 -mb-6 md:-mb-8 px-6 py-3.5 flex flex-wrap items-center justify-between text-xs text-slate-500 mt-6">
        <div className="flex items-center space-x-4">
          <span>Account ID: <code className="font-mono text-slate-700">{accountId}</code></span>
          <span>•</span>
          <span>Timezone: <span className="text-slate-700">Asia/Colombo (GMT+5:30)</span></span>
        </div>
        <div className="text-[11px] text-slate-400">Created on {createdAtFormatted} at 09:20 AM</div>
      </div>
    </>
  );
}
