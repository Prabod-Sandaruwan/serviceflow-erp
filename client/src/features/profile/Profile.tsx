import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';

export default function Profile() {
  const { user } = useAuth();
  const fullName = user?.employee?.fullName || user?.fullName || 'Not specified';
  const initials = (fullName !== 'Not specified' ? fullName : user?.email || 'U')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div style={{ padding: '2rem', maxWidth: '640px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, display: 'inline-block', background: 'linear-gradient(90deg, #0f172a 0%, #1d4ed8 50%, #2563eb 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.025em' }}>
          User Profile
        </h1>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: '#64748b' }}>
          Manage your personal account details and security settings
        </p>
      </div>

      <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.06)', overflow: 'hidden' }}>
        <div style={{ height: '5px', background: 'linear-gradient(90deg, #4f46e5 0%, #06b6d4 100%)' }} />

        <div style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.75rem', paddingBottom: '1.25rem', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.2rem', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)' }}>
              {initials}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#0f172a' }}>{fullName}</div>
              <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{user?.email}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '0.85rem', marginBottom: '2rem' }}>
            <div style={{ padding: '0.85rem 1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #edf2f7' }}>
              <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>Full Name</span>
              <span style={{ color: '#0f172a', fontWeight: 600, fontSize: '0.925rem' }}>{fullName}</span>
            </div>
            <div style={{ padding: '0.85rem 1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #edf2f7' }}>
              <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>Email Address</span>
              <span style={{ color: '#0f172a', fontWeight: 600, fontSize: '0.925rem' }}>{user?.email}</span>
            </div>
            <div style={{ padding: '0.85rem 1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #edf2f7' }}>
              <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>Role</span>
              <span style={{ display: 'inline-block', padding: '0.2rem 0.65rem', background: 'rgba(99, 102, 241, 0.12)', color: '#4f46e5', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700 }}>{user?.role}</span>
            </div>
          </div>

          <Link
            to="/profile/password"
            style={{
              display: 'inline-block',
              padding: '0.65rem 1.25rem',
              background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
              color: '#fff',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: 600,
              boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)',
            }}
          >
            Change Password
          </Link>
        </div>
      </div>
    </div>
  );
}
