import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export default function UnauthorisedPage() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        padding: '2rem',
        textAlign: 'center',
        color: '#1e293b',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '4rem',
          height: '4rem',
          borderRadius: '50%',
          backgroundColor: '#fee2e2',
          color: '#dc2626',
          marginBottom: '1rem',
        }}
      >
        <ShieldAlert style={{ width: '2.5rem', height: '2.5rem' }} />
      </div>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#0f172a' }}>
        403 - Access Denied
      </h1>
      <p style={{ margin: '0 0 1.5rem', color: '#64748b', maxWidth: '400px', fontSize: '0.95rem' }}>
        You do not have the required permissions to view this page. Please contact your system administrator if you believe this is an error.
      </p>
      <Link
        to="/"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '0.6rem 1.25rem',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          borderRadius: '6px',
          textDecoration: 'none',
          fontSize: '0.875rem',
          fontWeight: 500,
        }}
      >
        Return to Dashboard
      </Link>
    </div>
  );
}

export { UnauthorisedPage };
