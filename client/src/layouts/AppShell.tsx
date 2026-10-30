import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
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
        .nav-link:hover { color: #f8fafc !important; background: rgba(255, 255, 255, 0.05) !important; }
        .nav-link.active { background: linear-gradient(135deg, rgba(79, 70, 229, 0.25) 0%, rgba(99, 102, 241, 0.12) 100%) !important; color: #a5b4fc !important; border: 1px solid rgba(99, 102, 241, 0.35) !important; font-weight: 600 !important; }
        .logout-btn:hover { background: rgba(239, 68, 68, 0.22) !important; border-color: rgba(239, 68, 68, 0.5) !important; color: #fff !important; }
        .profile-btn:hover { background: rgba(99, 102, 241, 0.25) !important; border-color: rgba(99, 102, 241, 0.5) !important; color: #fff !important; }
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', background: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '0.3rem 0.65rem 0.3rem 0.45rem', borderRadius: '20px' }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
              {initial}
            </div>
            <span style={{ color: '#e2e8f0', fontWeight: 500, fontSize: '0.825rem' }}>{user?.email}</span>
            {user?.role && (
              <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.1rem 0.4rem', borderRadius: '9999px', background: user.role === 'ADMIN' ? 'rgba(239, 68, 68, 0.18)' : user.role === 'MANAGER' ? 'rgba(245, 158, 11, 0.18)' : 'rgba(59, 130, 246, 0.18)', color: user.role === 'ADMIN' ? '#fca5a5' : user.role === 'MANAGER' ? '#fcd34d' : '#93c5fd', border: `1px solid ${user.role === 'ADMIN' ? 'rgba(239, 68, 68, 0.35)' : user.role === 'MANAGER' ? 'rgba(245, 158, 11, 0.35)' : 'rgba(59, 130, 246, 0.35)'}` }}>
                {user.role}
              </span>
            )}
          </div>
          <NavLink to="/profile" className="profile-btn" style={{ color: '#c7d2fe', textDecoration: 'none', background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.28)', padding: '0.35rem 0.75rem', borderRadius: '7px', fontWeight: 600, fontSize: '0.8rem', transition: 'all 0.15s ease' }}>Profile</NavLink>
          <button type="button" className="logout-btn" onClick={handleLogout} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.35rem 0.75rem', borderRadius: '7px', cursor: 'pointer', transition: 'all 0.15s ease', fontWeight: 600, fontSize: '0.8rem' }}>Logout</button>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <aside className="sidebar" style={{ width: '240px', background: '#090d16', borderRight: '1px solid rgba(255, 255, 255, 0.07)', padding: '1rem 0.5rem', display: isMobileOpen ? 'block' : 'none', overflowY: 'auto' }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className="nav-link"
                onClick={() => setIsMobileOpen(false)}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.55rem 0.85rem',
                  borderRadius: '8px',
                  color: isActive ? '#a5b4fc' : '#94a3b8',
                  background: isActive ? 'linear-gradient(135deg, rgba(79, 70, 229, 0.25) 0%, rgba(99, 102, 241, 0.12) 100%)' : 'transparent',
                  border: isActive ? '1px solid rgba(99, 102, 241, 0.35)' : '1px solid transparent',
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                  fontWeight: isActive ? 600 : 400,
                  transition: 'all 0.15s ease',
                })}
              >
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
