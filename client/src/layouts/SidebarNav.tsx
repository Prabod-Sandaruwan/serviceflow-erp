import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard, Users, TrendingUp, Calendar, FileText, FolderKanban,
  CheckSquare, UserCheck, Receipt, CreditCard, BarChart3, PieChart, UserCog,
  ShieldAlert, ChevronLeft, PlusCircle, Activity, HelpCircle,
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
    <aside className="w-68 flex-shrink-0 flex flex-col h-full bg-white border-r border-slate-200 select-none z-30 transition-all">
      <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm">
            <span className="font-extrabold text-white text-base tracking-wider">SF</span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 text-sm tracking-tight leading-tight">ServiceFlow</span>
            <span className="text-[10px] text-slate-400 font-medium">Enterprise • Cloud ERP</span>
          </div>
        </div>
        <button type="button" onClick={onCloseMobile} className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition">
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      <div className="px-4 pt-3.5 pb-1">
        <Link to="/quotations" className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-blue-50/70 border border-blue-200/80 text-blue-600 hover:bg-blue-100/70 hover:border-blue-300 text-xs font-semibold transition shadow-xs">
          <PlusCircle className="w-4 h-4 text-blue-600" />
          <span>Quick Actions</span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {navCategories.map((category) => {
          const items = navConfig.filter((i) => i.category === category && hasRole(i.roles));
          if (items.length === 0) return null;
          return (
            <div key={category}>
              <div className="px-3 mb-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">{category}</div>
              <ul className="space-y-0.5">
                {items.map((item) => {
                  const Icon = ICONS[item.path] || LayoutDashboard;
                  return (
                    <li key={item.path}>
                      <NavLink
                        to={item.path} end={item.path === '/'} onClick={onCloseMobile}
                        className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                          isActive ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600 pl-2 rounded-l-none' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        {({ isActive }) => (
                          <>
                            <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                            <span className="truncate">{item.label}</span>
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

      <div className="p-3 border-t border-slate-100 space-y-1 text-slate-500 text-xs">
        <a href="#system-health" className="flex items-center gap-3 px-3 py-1.5 rounded-lg hover:bg-slate-50 hover:text-slate-800 transition">
          <Activity className="w-4 h-4 text-slate-400" /><span className="font-medium">System Health</span>
        </a>
        <a href="#documentation" className="flex items-center gap-3 px-3 py-1.5 rounded-lg hover:bg-slate-50 hover:text-slate-800 transition">
          <HelpCircle className="w-4 h-4 text-slate-400" /><span className="font-medium">Documentation</span>
        </a>
      </div>
    </aside>
  );
}

export default SidebarNav;
