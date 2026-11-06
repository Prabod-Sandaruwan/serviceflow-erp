import { useParams, Link } from 'react-router-dom';
import { useInvoice } from './hooks';
import { QueryBoundary } from '../../components/states/QueryBoundary';
import { StatusBadge, Badge } from '../../components/ui/StatusBadge';
import { InvoiceSections } from './InvoiceSections';
import { InvoiceActionBar } from './InvoiceActionBar';

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const query = useInvoice(id);
  const inv = query.data?.data;

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <Link to="/invoices" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.875rem' }}>
          &larr; Back to Invoices
        </Link>
      </div>

      <QueryBoundary query={query}>
        {inv && (
          <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                  <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, display: 'inline-block', background: 'linear-gradient(90deg, #0f172a 0%, #1d4ed8 50%, #2563eb 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.025em', fontFamily: 'monospace' }}>
                    {inv.invoiceNumber}
                  </h1>
                  <StatusBadge status={inv.status} />
                  {inv.isOverdue && (
                    <Badge variant="danger" style={{ fontWeight: 700 }} data-testid="overdue-badge">
                      Overdue
                    </Badge>
                  )}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                  Milestone #{inv.milestoneId}
                </div>
              </div>

              <InvoiceActionBar invoice={inv} refetch={query.refetch} />
            </div>

            <InvoiceSections invoice={inv} onPaymentVoided={query.refetch} />
          </div>
        )}
      </QueryBoundary>
    </div>
  );
}
