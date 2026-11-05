import { useParams, Link } from 'react-router-dom';
import { useClient } from './hooks';
import { QueryBoundary } from '../../components/states/QueryBoundary';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Forms';

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const clientQuery = useClient(id);

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <QueryBoundary query={clientQuery}>
        {clientQuery.data?.data && (() => {
          const c = clientQuery.data.data;
          return (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, display: 'inline-block', background: 'linear-gradient(90deg, #0f172a 0%, #2563eb 50%, #3b82f6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.025em', margin: 0 }}>{c.displayName}</h1>
                    <StatusBadge status={c.isActive ? 'ACTIVE' : 'INACTIVE'} />
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Type: {c.clientType} {c.registrationNumber ? `| Reg: ${c.registrationNumber}` : ''}</div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <Link to={`/clients/${c.id}/edit`} style={{ textDecoration: 'none' }}><Button type="button" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)', boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)', borderRadius: '8px', fontWeight: 600 }}>Edit Client</Button></Link>
                  <Link to="/clients" style={{ textDecoration: 'none' }}><Button type="button" variant="secondary" style={{ borderRadius: '8px' }}>Back to Clients</Button></Link>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', background: '#fff', padding: '1.5rem', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.05)', marginBottom: '1.5rem' }}>
                <div><strong style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.25rem' }}>Email</strong><div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>{c.email || 'None'}</div></div>
                <div><strong style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.25rem' }}>Phone</strong><div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>{c.phone || 'None'}</div></div>
                <div><strong style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.25rem' }}>Contact Person</strong><div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>{c.contactPerson || 'None'}</div></div>
                <div><strong style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.25rem' }}>Address</strong><div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>{c.address || 'None'}</div></div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 2px 8px -2px rgba(15, 23, 42, 0.04)' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.25rem' }}>Leads</h3>
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Associated sales leads will appear here (CRM-007..011).</div>
                </div>
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 2px 8px -2px rgba(15, 23, 42, 0.04)' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.25rem' }}>Quotations</h3>
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Associated quotations will appear here (Phase 7).</div>
                </div>
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.25rem', boxShadow: '0 2px 8px -2px rgba(15, 23, 42, 0.04)' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.25rem' }}>Projects</h3>
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Active projects and milestones will appear here (Phase 8).</div>
                </div>
              </div>
            </div>
          );
        })()}
      </QueryBoundary>
    </div>
  );
}
