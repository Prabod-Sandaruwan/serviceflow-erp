import { useParams, Link } from 'react-router-dom';
import { useClient } from './hooks';
import { QueryBoundary } from '../../components/states/QueryBoundary';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Forms';

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const clientQuery = useClient(id);

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
      <QueryBoundary query={clientQuery}>
        {clientQuery.data?.data && (() => {
          const c = clientQuery.data.data;
          return (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>{c.displayName}</h1>
                    <StatusBadge status={c.isActive ? 'ACTIVE' : 'INACTIVE'} />
                  </div>
                  <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Type: {c.clientType} {c.registrationNumber ? `| Reg: ${c.registrationNumber}` : ''}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Link to={`/clients/${c.id}/edit`} style={{ textDecoration: 'none' }}><Button type="button">Edit Client</Button></Link>
                  <Link to="/clients" style={{ textDecoration: 'none' }}><Button type="button" variant="secondary">Back to Clients</Button></Link>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '6px', marginBottom: '2rem' }}>
                <div><strong style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Email</strong><div>{c.email || 'None'}</div></div>
                <div><strong style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Phone</strong><div>{c.phone || 'None'}</div></div>
                <div><strong style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Contact Person</strong><div>{c.contactPerson || 'None'}</div></div>
                <div><strong style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Address</strong><div>{c.address || 'None'}</div></div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '1rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>Leads</h3>
                  <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Associated sales leads will appear here (CRM-007..011).</div>
                </div>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '1rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>Quotations</h3>
                  <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Associated quotations will appear here (Phase 7).</div>
                </div>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '1rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#334155', marginBottom: '0.5rem' }}>Projects</h3>
                  <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Active projects and milestones will appear here (Phase 8).</div>
                </div>
              </div>
            </div>
          );
        })()}
      </QueryBoundary>
    </div>
  );
}

