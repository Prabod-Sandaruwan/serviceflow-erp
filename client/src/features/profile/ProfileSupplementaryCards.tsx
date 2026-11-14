import { useAuth } from '../auth/AuthProvider';

export function ProfileSupplementaryCards() {
  const { logout, user } = useAuth();
  const department = user?.employee?.department || 'Operations & Core IT';
  const accessLabel = user?.role === 'ADMIN' ? 'Direct Admin Access' : 'Direct Staff Access';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-blue-50 text-blue-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-slate-900">Current Session</h3>
          </div>
          <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Active Now</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Browser on Windows • Colombo, Sri Lanka
        </p>
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">Session expires in 4 hours</span>
          <button
            type="button"
            onClick={() => logout()}
            className="text-rose-600 hover:text-rose-700 font-medium transition-colors"
          >
            Log out this session
          </button>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-indigo-50 text-indigo-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-slate-900">Assigned Branch</h3>
          </div>
          <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">Primary HQ</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          ServiceFlow Technologies Ltd. • Colombo 03, Western Province
        </p>
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">Department: {department}</span>
          <span className="text-indigo-600 font-medium">{accessLabel}</span>
        </div>
      </div>
    </div>
  );
}
