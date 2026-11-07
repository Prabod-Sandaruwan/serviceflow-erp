import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, TrendingUp, Calendar, FileText, FolderKanban,
  CheckSquare, UserCheck, Receipt, CreditCard, BarChart3, PieChart, UserCog, ShieldAlert, ChevronLeft,
} from 'lucide-react';
import { useAuth } from '../features/auth/AuthProvider';
import { navConfig, navCategories } from './navConfig';

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  '/': LayoutDashboard, '/clients': Users, '/leads': TrendingUp, '/follow-ups': Calendar,
  '/quotations': FileText, '/projects': FolderKanban, '/tasks': CheckSquare, '/admin/employees': UserCheck,
  '/invoices': Receipt, '/expenses': CreditCard, '/reports/finance': BarChart3, '/reports/projects': PieChart,
  '/admin/users': UserCog, '/admin/audit': ShieldAlert,
};

export function SidebarNav({ onCloseMobile }: { onCloseMobile?: () => void }) {
  const { hasRole } = useAuth();

  return (
    <aside className="w-72 flex-shrink-0 flex flex-col h-full bg-[#080c16] border-r border-slate-800/80 select-none z-30 transition-all duration-300">
      <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800/80 bg-[#080c16]">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <span className="font-extrabold text-white text-lg tracking-wider">S</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white text-base tracking-tight">ServiceFlow</span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 uppercase">ERP</span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium tracking-wide">IT Solutions Suite</span>
          </div>
        </div>
        <button type="button" onClick={onCloseMobile} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/70 border border-transparent hover:border-slate-700/60 transition">
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navCategories.map((category) => {
          const items = navConfig.filter((i) => i.category === category && hasRole(i.roles));
          if (items.length === 0) return null;
          return (
            <div key={category}>
              <div className="px-3 mb-2 flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">{category}</span>
              </div>
              <ul className="space-y-1">
                {items.map((item) => {
                  const Icon = ICONS[item.path] || LayoutDashboard;
                  return (
                    <li key={item.path}>
                      <NavLink
                        to={item.path} end={item.path === '/'} onClick={onCloseMobile}
                        className={({ isActive }) => isActive
                          ? 'relative flex items-center justify-between px-3 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-indigo-950/90 via-indigo-900/50 to-indigo-950/30 border border-indigo-500/40 shadow-sm shadow-indigo-900/30'
                          : 'flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors group'}
                      >
                        {({ isActive }) => (
                          <>
                            {isActive && <span className="absolute left-0 top-2 bottom-2 w-1 bg-indigo-500 rounded-r-full shadow-sm shadow-indigo-400" />}
                            <div className="flex items-center gap-3 pl-1">
                              <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-indigo-400'}`} />
                              <span className={isActive ? 'text-white' : 'group-hover:text-white'}>{item.label}</span>
                            </div>
                          </>
                        )}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-800/80 bg-[#080c16]">
        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/90 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" /></span>
            <div><div className="text-[11px] font-semibold text-white leading-tight">Colombo HQ Node</div><div className="text-[10px] text-emerald-400 font-medium leading-tight">Cloud Sync: Realtime</div></div>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono border border-slate-700/50">v2.4</span>
        </div>
      </div>
    </aside>
  );
}

export default SidebarNav;
