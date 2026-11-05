import { useParams, Link } from 'react-router-dom';
import { useQuotation } from './hooks';
import { QueryBoundary } from '../../components/states/QueryBoundary';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ActionBar } from './ActionBar';

export default function QuotationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const query = useQuotation(id);
  const q = query.data?.data;

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <Link to="/quotations" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.875rem' }}>&larr; Back to Quotations</Link>
      </div>

      <QueryBoundary query={query}>
        {q && (
          <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                  <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, display: 'inline-block', background: 'linear-gradient(90deg, #0f172a 0%, #2563eb 50%, #3b82f6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.025em', fontFamily: 'monospace' }}>{q.quotationNumber}</h1>
                  <StatusBadge status={q.status} />
                  {q.isExpired && <span style={{ background: '#fee2e2', color: '#991b1b', fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.5rem', borderRadius: '9999px' }}>Expired</span>}
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#334155' }}>{q.title}</div>
                <div style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.25rem' }}>Client: <strong>{q.clientName || `Client #${q.clientId}`}</strong> | Valid Until: <strong>{q.validUntil ? new Date(q.validUntil).toLocaleDateString() : '-'}</strong></div>
              </div>
              <ActionBar quotation={q} refetch={query.refetch} />
            </div>

            {(q.rejectionReason || q.approverName || q.decidedAt || q.responseNote) && (
              <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
                {q.rejectionReason && <div style={{ color: '#991b1b', marginBottom: '0.25rem' }}><strong>Rejection Reason:</strong> {q.rejectionReason}</div>}
                {q.approverName && <div><strong>Decided by:</strong> {q.approverName} ({q.decidedAt ? new Date(q.decidedAt).toLocaleString() : ''})</div>}
                {q.responseNote && <div style={{ marginTop: '0.25rem' }}><strong>Client Response Note:</strong> {q.responseNote}</div>}
              </div>
            )}

            <div>
              <h3 style={{ margin: '0 0 0.75rem', fontSize: '1rem', fontWeight: 700 }}>Items</h3>
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                  <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                    <tr>
                      <th style={{ padding: '0.65rem 1rem' }}>#</th>
                      <th style={{ padding: '0.65rem 1rem' }}>Description</th>
                      <th style={{ padding: '0.65rem 1rem', textAlign: 'right' }}>Qty</th>
                      <th style={{ padding: '0.65rem 1rem', textAlign: 'right' }}>Unit Price</th>
                      <th style={{ padding: '0.65rem 1rem', textAlign: 'right' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(q.items || []).map((it, idx) => (
                      <tr key={it.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.65rem 1rem', color: '#64748b' }}>{idx + 1}</td>
                        <td style={{ padding: '0.65rem 1rem', fontWeight: 500 }}>{it.description}</td>
                        <td style={{ padding: '0.65rem 1rem', textAlign: 'right' }}>{it.quantity}</td>
                        <td style={{ padding: '0.65rem 1rem', textAlign: 'right' }}>${Number(it.unitPrice).toFixed(2)}</td>
                        <td style={{ padding: '0.65rem 1rem', textAlign: 'right', fontWeight: 600 }}>${Number(it.lineAmount).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ width: '260px', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal:</span><span>${Number(q.subtotal).toFixed(2)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Tax:</span><span>${Number(q.taxAmount).toFixed(2)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 800, borderTop: '2px solid #0f172a', paddingTop: '0.5rem', color: '#0f172a' }}>
                  <span>Total:</span><span>${Number(q.total).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {q.notes && <div style={{ fontSize: '0.85rem', color: '#475569', background: '#f8fafc', padding: '0.75rem', borderRadius: '6px' }}><strong>Notes:</strong> {q.notes}</div>}
          </div>
        )}
      </QueryBoundary>
    </div>
  );
}
export { QuotationDetailPage };
