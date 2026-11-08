import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, TrendingUp, Calendar, FileText, FolderKanban,
  CheckSquare, UserCheck, Receipt, CreditCard, BarChart3, PieChart, UserCog,
  ShieldAlert, ChevronLeft, ChevronRight,
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
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside className={`${isCollapsed ? 'w-18' : 'w-64'} flex-shrink-0 flex flex-col h-full bg-white border-r border-slate-200 select-none z-30 transition-all duration-200`}>
      <div className={`h-16 flex items-center ${isCollapsed ? 'justify-center px-2' : 'justify-between px-4'} border-b border-slate-100`}>
        <div className="flex items-center gap-3 overflow-hidden cursor-pointer" onClick={() => isCollapsed && setIsCollapsed(false)}>
          <div className="h-9 w-9 shrink-0 rounded-xl bg-blue-600 flex items-center justify-center shadow-xs">
            <span className="font-extrabold text-white text-base">SF</span>
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-slate-900 text-sm tracking-tight truncate leading-tight">ServiceFlow</span>
              <span className="text-[10px] text-slate-400 font-medium truncate">Enterprise ERP</span>
            </div>
          )}
        </div>
        <button type="button" onClick={() => setIsCollapsed(!isCollapsed)} className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition">
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
        <button type="button" onClick={onCloseMobile} className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition">
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-3">
        {navCategories.map((category) => {
          const items = navConfig.filter((i) => i.category === category && hasRole(i.roles));
          if (items.length === 0) return null;
          return (
            <div key={category}>
              {!isCollapsed ? (
                <div className="px-2 mb-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase truncate">{category}</div>
              ) : <div className="my-1.5 border-t border-slate-100" />}
              <ul className="space-y-0.5">
                {items.map((item) => {
                  const Icon = ICONS[item.path] || LayoutDashboard;
                  return (
                    <li key={item.path}>
                      <NavLink
                        to={item.path} end={item.path === '/'} onClick={onCloseMobile} title={item.label}
                        className={({ isActive }) => `flex items-center ${isCollapsed ? 'justify-center p-2' : 'gap-3 px-3 py-2'} rounded-lg text-xs font-semibold transition ${
                          isActive ? 'bg-blue-50 text-blue-600 ' + (isCollapsed ? 'border border-blue-200' : 'border-l-4 border-blue-600 pl-2 rounded-l-none') : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                      >
                        {({ isActive }) => (
                          <>
                            <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                            <span className={isCollapsed ? 'sr-only' : 'truncate'}>{item.label}</span>
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

      <div className="p-2 border-t border-slate-100 flex items-center justify-center">
        <button
          type="button" onClick={() => setIsCollapsed(!isCollapsed)} title={isCollapsed ? 'Expand sidebar' : 'Minimize sidebar'}
          className={`flex items-center ${isCollapsed ? 'justify-center p-2' : 'gap-2 px-3 py-2 w-full'} rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 text-xs font-medium transition`}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" /><span>Collapse</span></>}
        </button>
      </div>
    </aside>
  );
}

export default SidebarNav;
