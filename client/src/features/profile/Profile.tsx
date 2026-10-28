import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';

export default function Profile() {
  const { user } = useAuth();
  const fullName = user?.employee?.fullName || user?.fullName || 'Not specified';

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1.5rem', color: '#0f172a' }}>
        User Profile
      </h1>
      <div
        style={{
          background: '#fff',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          padding: '1.5rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        }}
      >
        <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem', fontSize: '0.95rem' }}>
          <div>
            <span style={{ color: '#64748b', display: 'block', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>
              Full Name
            </span>
            <span style={{ color: '#1e293b', fontWeight: 500 }}>{fullName}</span>
          </div>
          <div>
            <span style={{ color: '#64748b', display: 'block', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>
              Email Address
            </span>
            <span style={{ color: '#1e293b', fontWeight: 500 }}>{user?.email}</span>
          </div>
          <div>
            <span style={{ color: '#64748b', display: 'block', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>
              Role
            </span>
            <span style={{ color: '#1e293b', fontWeight: 500 }}>{user?.role}</span>
          </div>
        </div>

        <Link
          to="/profile/password"
          style={{
            display: 'inline-block',
            padding: '0.5rem 1rem',
            background: '#2563eb',
            color: '#fff',
            borderRadius: '4px',
            textDecoration: 'none',
            fontSize: '0.875rem',
            fontWeight: 500,
          }}
        >
          Change Password
        </Link>
      </div>
    </div>
  );
}
