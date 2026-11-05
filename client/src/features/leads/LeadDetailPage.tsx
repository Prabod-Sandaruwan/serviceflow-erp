import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLead } from './hooks';
import { QueryBoundary } from '../../components/states/QueryBoundary';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Forms';
import { ConvertDialog } from './ConvertDialog';
import { FollowUps } from './FollowUps';

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const leadQuery = useLead(id);
  const [isConvertDialogOpen, setIsConvertDialogOpen] = useState(false);

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <QueryBoundary query={leadQuery}>
        {leadQuery.data?.data && (() => {
          const l = leadQuery.data.data;
          const isConverted = l.status === 'CONVERTED' || l.status === 'WON' || Boolean(l.convertedClientId);
          return (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, display: 'inline-block', background: 'linear-gradient(90deg, #0f172a 0%, #2563eb 50%, #3b82f6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.025em', margin: 0 }}>
                      {l.title || `Lead #${l.id}`}
                    </h1>
                    <StatusBadge status={l.status} />
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    Owner: {l.owner?.fullName || l.owner?.email || `User #${l.ownerId}`} {l.createdAt ? `• Created ${new Date(l.createdAt).toLocaleDateString()}` : ''}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {isConverted ? (
                    <Link to={`/clients/${l.convertedClientId}`} style={{ textDecoration: 'none' }}>
                      <Button type="button" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderRadius: '8px', fontWeight: 600 }}>View Client</Button>
                    </Link>
                  ) : (
                    <Button type="button" onClick={() => setIsConvertDialogOpen(true)} style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)', borderRadius: '8px', fontWeight: 600 }}>Convert to Client</Button>
                  )}
                  {!isConverted && (
                    <Link to={`/leads/${l.id}/edit`} style={{ textDecoration: 'none' }}>
                      <Button type="button" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)', boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)', borderRadius: '8px', fontWeight: 600 }}>Edit Lead</Button>
                    </Link>
                  )}
                  <Link to="/leads" style={{ textDecoration: 'none' }}>
                    <Button type="button" variant="secondary" style={{ borderRadius: '8px' }}>Back to Leads</Button>
                  </Link>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', background: '#fff', padding: '1.5rem', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.05)', marginBottom: '1.5rem' }}>
                <div>
                  <strong style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.25rem' }}>Estimated Value</strong>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>{l.expectedValue != null ? `$${l.expectedValue.toLocaleString()}` : 'Not set'}</div>
                </div>
                <div>
                  <strong style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.25rem' }}>Client ID</strong>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>
                    {l.convertedClientId ? (
                      <Link to={`/clients/${l.convertedClientId}`} style={{ color: '#4f46e5', textDecoration: 'none', fontWeight: 600 }}>
                        Client #{l.convertedClientId} (Converted)
                      </Link>
                    ) : 'Not converted'}
                  </div>
                </div>
                <div>
                  <strong style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.25rem' }}>Owner ID</strong>
                  <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>{l.ownerId}</div>
                </div>
                {l.status === 'LOST' && l.lostReason && (
                  <div>
                    <strong style={{ fontSize: '0.75rem', color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.25rem' }}>Lost Reason</strong>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#991b1b' }}>{l.lostReason}</div>
                  </div>
                )}
              </div>

              <FollowUps leadId={l.id} />
              <ConvertDialog leadId={l.id} isOpen={isConvertDialogOpen} onClose={() => setIsConvertDialogOpen(false)} />
            </div>
          );
        })()}
      </QueryBoundary>
    </div>
  );
}
