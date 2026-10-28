import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { Button } from '../../components/ui/Forms';

export default function LogoutConfirm() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleConfirm = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/login');
    } catch {
      setIsLoggingOut(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '75vh', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div style={{ width: '100%', maxWidth: '440px', background: '#fff', borderRadius: '16px', padding: '2.25rem 2rem', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(15,23,42,0.08)', textAlign: 'center' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(239,68,68,0.1)', color: '#dc2626', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
          <LogOut style={{ width: '28px', height: '28px' }} />
        </div>
        <h1 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
          Confirm Sign Out
        </h1>
        <p style={{ margin: '0 0 1.5rem', fontSize: '0.875rem', color: '#64748b', lineHeight: 1.5 }}>
          Are you sure you want to log out of your session as <strong style={{ color: '#0f172a' }}>{user?.email || 'User'}</strong>? Any unsaved changes may be lost.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <Button type="button" variant="secondary" onClick={() => navigate(-1)} disabled={isLoggingOut} style={{ flex: 1, padding: '0.65rem 1rem' }}>
            Cancel
          </Button>
          <Button type="button" variant="danger" onClick={handleConfirm} disabled={isLoggingOut} style={{ flex: 1, padding: '0.65rem 1rem', background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)', boxShadow: '0 4px 12px rgba(220,38,38,0.25)' }}>
            {isLoggingOut ? 'Signing out...' : 'Log Out'}
          </Button>
        </div>
      </div>
    </div>
  );
}
