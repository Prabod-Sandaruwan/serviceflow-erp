import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { User as UserIcon, LogOut } from 'lucide-react';
import { useAuth } from '../features/auth/AuthProvider';
import { navConfig } from './navConfig';

export function AppShell() {
  const { user, hasRole } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => navigate('/logout');
  const navItems = navConfig.filter((item) => hasRole(item.roles));
  const initial = (user?.fullName || user?.email || 'U')[0].toUpperCase();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <style>{`
        @media (min-width: 768px) { .sidebar { display: block !important; } .mobile-btn { display: none !important; } }
        .nav-link { display: flex; align-items: center; padding: 0.55rem 0.85rem; border-radius: 8px; color: #94a3b8; text-decoration: none; font-size: 0.85rem; border: 1px solid transparent; transition: all 0.15s ease; }
        .nav-link:hover { color: #f8fafc !important; background: rgba(255, 255, 255, 0.05) !important; }
        .nav-link.active { background: linear-gradient(135deg, rgba(79, 70, 229, 0.25) 0%, rgba(99, 102, 241, 0.12) 100%) !important; color: #a5b4fc !important; border: 1px solid rgba(99, 102, 241, 0.35) !important; font-weight: 600 !important; }
        .hdr-btn { display: inline-flex; align-items: center; gap: 0.4rem; height: 32px; padding: 0 0.8rem; border-radius: 7px; font-size: 0.8125rem; font-weight: 500; text-decoration: none; transition: all 0.15s ease; cursor: pointer; }
        .hdr-profile { background: #1e1b4b; border: 1px solid #3730a3; color: #c7d2fe; }
        .hdr-profile:hover { background: #312e81 !important; border-color: #4f46e5 !important; color: #ffffff !important; }
        .hdr-logout { background: #450a0a; border: 1px solid #7f1d1d; color: #fca5a5; }
        .hdr-logout:hover { background: #7f1d1d !important; border-color: #991b1b !important; color: #ffffff !important; }
      `}</style>

      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.65rem 1.5rem', background: '#0b0f19', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.35)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button type="button" className="mobile-btn" onClick={() => setIsMobileOpen((prev) => !prev)} style={{ background: '#1e293b', border: '1px solid #334155', color: '#f8fafc', fontSize: '1rem', cursor: 'pointer', borderRadius: '6px', padding: '0.25rem 0.55rem' }}>☰</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(99, 102, 241, 0.4)' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 900, color: '#ffffff' }}>S</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em', color: '#ffffff' }}>ServiceFlow</span>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em', color: '#818cf8', background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.35)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>ERP</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '0.25rem 0.65rem 0.25rem 0.35rem', borderRadius: '9999px' }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>{initial}</div>
            <span style={{ color: '#e2e8f0', fontWeight: 500, fontSize: '0.8125rem' }}>{user?.email}</span>
            {user?.role && (
              <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.1rem 0.4rem', borderRadius: '9999px', background: user.role === 'ADMIN' ? 'rgba(239, 68, 68, 0.18)' : user.role === 'MANAGER' ? 'rgba(245, 158, 11, 0.18)' : 'rgba(59, 130, 246, 0.18)', color: user.role === 'ADMIN' ? '#fca5a5' : user.role === 'MANAGER' ? '#fcd34d' : '#93c5fd', border: `1px solid ${user.role === 'ADMIN' ? 'rgba(239, 68, 68, 0.35)' : user.role === 'MANAGER' ? 'rgba(245, 158, 11, 0.35)' : 'rgba(59, 130, 246, 0.35)'}` }}>
                {user.role}
              </span>
            )}
          </div>

          <div style={{ width: '1px', height: '20px', background: 'rgba(255, 255, 255, 0.12)' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
            <NavLink to="/profile" className="hdr-btn hdr-profile"><UserIcon size={14} /><span>Profile</span></NavLink>
            <button type="button" className="hdr-btn hdr-logout" onClick={handleLogout}><LogOut size={14} /><span>Logout</span></button>
          </div>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <aside className="sidebar" style={{ width: '240px', background: '#090d16', borderRight: '1px solid rgba(255, 255, 255, 0.07)', padding: '1rem 0.5rem', display: isMobileOpen ? 'block' : 'none', overflowY: 'auto' }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {navItems.map((item) => (
              <NavLink key={item.path} to={item.path} end={item.path === '/'} className="nav-link" onClick={() => setIsMobileOpen(false)}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main style={{ flex: 1, overflowY: 'auto', background: '#f8fafc', color: '#0f172a' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppShell;
