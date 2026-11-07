import { NavLink } from 'react-router-dom';
import { User as UserIcon, LogOut, ChevronDown, Menu } from 'lucide-react';
import { useAuth } from '../features/auth/AuthProvider';

export interface TopHeaderProps {
  onToggleMobile?: () => void;
  onLogout: () => void;
}

export function TopHeader({ onToggleMobile, onLogout }: TopHeaderProps) {
  const { user } = useAuth();
  const initial = (user?.fullName || user?.email || 'U')[0].toUpperCase();
  const role = user?.role || 'STAFF';

  const roleBadgeStyle = role === 'ADMIN'
    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    : role === 'MANAGER'
      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
      : 'bg-blue-500/20 text-blue-300 border-blue-500/30';

  const subtitle = role === 'ADMIN' ? 'Head of Operations' : role === 'MANAGER' ? 'Project Delivery' : 'Engineering & Support';

  return (
    <header className="h-16 flex-shrink-0 bg-[#0b1120] border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between z-20 shadow-sm">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMobile}
          aria-label="Open mobile menu"
          className="md:hidden p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-3 pl-1.5 pr-2.5 py-1 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition group cursor-pointer">
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-md">
              {initial}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
          </div>

          <div className="flex flex-col text-left leading-tight hidden md:block">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-white group-hover:text-indigo-300 transition-colors">
                {user?.email}
              </span>
              <span className={`px-1.5 py-0.2 text-[9px] font-bold rounded border uppercase tracking-wider ${roleBadgeStyle}`}>
                {role}
              </span>
            </div>
            <span className="text-[10px] text-slate-400">{subtitle}</span>
          </div>

          <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
        </div>

        <NavLink
          to="/profile"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-800 transition"
        >
          <UserIcon className="w-3.5 h-3.5 text-slate-400" />
          <span>Profile</span>
        </NavLink>

        <button
          type="button"
          onClick={onLogout}
          title="Sign out of ServiceFlow ERP"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500 hover:text-white border border-rose-500/20 transition-all duration-150 active:scale-95"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}

export default TopHeader;
