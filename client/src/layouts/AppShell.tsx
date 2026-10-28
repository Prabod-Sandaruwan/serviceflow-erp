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
      <style>{'@media (min-width: 768px) { .sidebar { display: block !important; } .mobile-btn { display: none !important; } }'}</style>

      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1.5rem', background: '#0f172a', color: '#fff', borderBottom: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button type="button" className="mobile-btn" onClick={() => setIsMobileOpen((prev) => !prev)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.25rem', cursor: 'pointer' }}>
            ☰
          </button>
          <span style={{ fontWeight: 700, fontSize: '1.125rem' }}>ServiceFlow ERP</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.875rem' }}>
          <span>{user?.email}</span>
          <NavLink to="/profile" style={{ color: '#93c5fd', textDecoration: 'none' }}>Profile</NavLink>
          <button type="button" onClick={handleLogout} style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '0.25rem 0.75rem', borderRadius: '4px', cursor: 'pointer' }}>Logout</button>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <aside className="sidebar" style={{ width: '240px', background: '#1e293b', borderRight: '1px solid #334155', padding: '1rem 0', display: isMobileOpen ? 'block' : 'none', overflowY: 'auto' }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={() => setIsMobileOpen(false)}
                style={({ isActive }) => ({
                  display: 'block',
                  padding: '0.5rem 1.25rem',
                  color: isActive ? '#fff' : '#94a3b8',
                  background: isActive ? '#334155' : 'transparent',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 400,
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
