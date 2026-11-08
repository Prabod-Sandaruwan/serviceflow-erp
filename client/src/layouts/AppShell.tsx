import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { SidebarNav } from './SidebarNav';
import { TopHeader } from './TopHeader';

export function AppShell() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => navigate('/logout');

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {isMobileOpen && (
        <div
          role="presentation"
          className="fixed inset-0 z-20 bg-black/60 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-30 md:static md:translate-x-0 transition-transform duration-200 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarNav onCloseMobile={() => setIsMobileOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col h-full min-w-0 bg-[#f8fafc]">
        <TopHeader onToggleMobile={() => setIsMobileOpen((prev) => !prev)} onLogout={handleLogout} />
        <main className="flex-1 overflow-y-auto bg-slate-50 text-slate-800 p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppShell;
