import { useState } from 'react';
import { api } from '../../lib/api';
import { useToast } from '../../components/ui/Toast';

function getClientBrowserInfo(): string {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  let b = 'Browser';
  if (ua.includes('Edg/')) b = 'Edge';
  else if (ua.includes('Chrome/')) b = 'Chrome';
  else if (ua.includes('Firefox/')) b = 'Firefox';
  else if (ua.includes('Safari/')) b = 'Safari';
  let os = 'Operating System';
  if (ua.includes('Win')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone')) os = 'iOS';
  return `${b} on ${os}`;
}

export function ProfileSupplementaryCards() {
  const { addToast } = useToast();
  const [loggingOut, setLoggingOut] = useState(false);
  const browserInfo = getClientBrowserInfo();

  const handleLogoutOtherDevices = async () => {
    setLoggingOut(true);
    try {
      await api.post('/auth/logout-other-sessions');
      addToast('All other device sessions have been terminated', 'success');
    } catch {
      addToast('Failed to terminate other sessions', 'error');
    } finally {
      setLoggingOut(false);
    }
  };

  return (
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
      <p className="text-xs text-slate-600 leading-relaxed">{browserInfo} • Current Active Device</p>
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-slate-500">Session expires in 8 hours (Rolling)</span>
        <button
          type="button"
          disabled={loggingOut}
          onClick={handleLogoutOtherDevices}
          className="text-rose-600 hover:text-rose-700 font-medium transition-colors disabled:opacity-50"
        >
          {loggingOut ? 'Terminating...' : 'Log out all other devices'}
        </button>
      </div>
    </div>
  );
}
