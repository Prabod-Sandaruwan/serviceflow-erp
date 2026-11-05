import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useInvoice, downloadInvoicePdf } from './hooks';
import { QueryBoundary } from '../../components/states/QueryBoundary';
import { StatusBadge, Badge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Forms';
import { useToast } from '../../components/ui/Toast';
import { InvoiceSections } from './InvoiceSections';

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const query = useInvoice(id);
  const { addToast } = useToast();
  const [downloading, setDownloading] = useState(false);
  const inv = query.data?.data;

  const handleDownload = async () => {
    if (!inv) return;
    try {
      setDownloading(true);
      await downloadInvoicePdf(inv.id, `${inv.invoiceNumber || 'invoice'}.pdf`);
      addToast('Invoice PDF downloaded', 'success');
    } catch (e: any) {
      addToast(e?.message || 'Failed to download PDF', 'error');
    } finally {
      setDownloading(false);
    }
  };

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
                  <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', fontFamily: 'monospace' }}>
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

              <Button
                type="button"
                onClick={handleDownload}
                disabled={downloading}
                style={{ background: '#4f46e5', fontWeight: 600 }}
              >
                {downloading ? 'Downloading...' : 'Download PDF'}
              </Button>
            </div>

            <InvoiceSections invoice={inv} />
          </div>
        )}
      </QueryBoundary>
    </div>
  );
}
