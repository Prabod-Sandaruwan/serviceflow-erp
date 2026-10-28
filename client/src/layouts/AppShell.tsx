import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthProvider';
import { navConfig } from './navConfig';

export function AppShell() {
  const { user, logout, hasRole } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = navConfig.filter((item) => hasRole(item.roles));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <style>{`
        @media (min-width: 768px) { .sidebar { display: block !important; } .mobile-btn { display: none !important; } }
        .nav-link:hover { color: #f8fafc !important; background: rgba(255, 255, 255, 0.05) !important; }
        .nav-link.active { background: linear-gradient(135deg, rgba(79, 70, 229, 0.25) 0%, rgba(99, 102, 241, 0.12) 100%) !important; color: #a5b4fc !important; border: 1px solid rgba(99, 102, 241, 0.35) !important; font-weight: 600 !important; }
        .logout-btn:hover { background: rgba(239, 68, 68, 0.22) !important; border-color: rgba(239, 68, 68, 0.5) !important; }
        .profile-btn:hover { background: rgba(255, 255, 255, 0.12) !important; color: #fff !important; }
      `}</style>

      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1.5rem', background: 'linear-gradient(180deg, #0f172a 0%, #090d16 100%)', color: '#fff', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button type="button" className="mobile-btn" onClick={() => setIsMobileOpen((prev) => !prev)} style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', fontSize: '1.1rem', cursor: 'pointer', borderRadius: '6px', padding: '0.25rem 0.5rem' }}>
            ☰
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6366f1', boxShadow: '0 0 10px #6366f1' }} />
            <span style={{ fontWeight: 800, fontSize: '1.125rem', letterSpacing: '-0.025em', background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ServiceFlow ERP</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', fontSize: '0.85rem' }}>
          <span style={{ color: '#94a3b8', background: 'rgba(255, 255, 255, 0.05)', padding: '0.25rem 0.75rem', borderRadius: '9999px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>{user?.email}</span>
          <NavLink to="/profile" className="profile-btn" style={{ color: '#c7d2fe', textDecoration: 'none', background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.25)', padding: '0.3rem 0.75rem', borderRadius: '6px', transition: 'all 0.2s ease' }}>Profile</NavLink>
          <button type="button" className="logout-btn" onClick={handleLogout} style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.3rem 0.75rem', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s ease', fontWeight: 500 }}>Logout</button>
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

        <main style={{ flex: 1, overflowY: 'auto', background: '#f8fafc' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppShell;
