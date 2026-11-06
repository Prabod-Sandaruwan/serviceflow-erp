import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { Button } from '../../components/ui/Forms';
import { useToast } from '../../components/ui/Toast';
import { downloadInvoicePdf, useIssueInvoice, useCancelInvoice } from './hooks';
import { IssueDialog } from './IssueDialog';
import { CancelDialog } from './CancelDialog';
import { PaymentDialog } from './PaymentDialog';
import type { Invoice } from './types';

export function InvoiceActionBar({ invoice, refetch }: { invoice: Invoice; refetch: () => void }) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState(false);
  const [showIssue, setShowIssue] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  const issueM = useIssueInvoice();
  const cancelM = useCancelInvoice();
  const isManager = user?.role === 'ADMIN' || user?.role === 'MANAGER';
  const canPay = invoice.status === 'ISSUED' || invoice.status === 'PARTIALLY_PAID';

  const handleDownload = async () => {
    try {
      setDownloading(true);
      await downloadInvoicePdf(invoice.id, `${invoice.invoiceNumber || 'invoice'}.pdf`);
      addToast('Invoice PDF downloaded', 'success');
    } catch (e: any) { addToast(e?.message || 'Download failed', 'error'); }
    finally { setDownloading(false); }
  };

  const onIssue = async (data: { issueDate: string; dueDate: string }) => {
    try {
      await issueM.mutateAsync({ id: invoice.id, ...data });
      addToast('Invoice issued successfully', 'success');
      refetch();
    } catch (e: any) { addToast(e?.message || 'Failed to issue invoice', 'error'); }
  };

  const onCancel = async (reason: string) => {
    try {
      await cancelM.mutateAsync({ id: invoice.id, reason });
      addToast('Invoice cancelled successfully', 'success');
      refetch();
    } catch (e: any) { addToast(e?.message || 'Failed to cancel invoice', 'error'); throw e; }
  };

  return (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
      <Button type="button" onClick={handleDownload} disabled={downloading} style={{ background: '#4f46e5', fontWeight: 600 }}>
        {downloading ? 'Downloading...' : 'Download PDF'}
      </Button>

      {canPay && (
        <Button type="button" onClick={() => setShowPayment(true)} style={{ background: '#16a34a', fontWeight: 600 }} data-testid="record-payment-btn">
          Record Payment
        </Button>
      )}

      {isManager && invoice.status === 'DRAFT' && (
        <>
          <Button type="button" onClick={() => navigate(`/invoices/${invoice.id}/edit`)} variant="secondary" style={{ fontWeight: 600 }}>Edit</Button>
          <Button type="button" onClick={() => setShowIssue(true)} style={{ background: '#0284c7', fontWeight: 600 }}>Issue</Button>
          <Button type="button" variant="danger" onClick={() => setShowCancel(true)} style={{ fontWeight: 600 }}>Cancel</Button>
        </>
      )}

      {isManager && invoice.status === 'ISSUED' && (
        <Button type="button" variant="danger" onClick={() => setShowCancel(true)} style={{ fontWeight: 600 }}>Cancel</Button>
      )}

      <IssueDialog isOpen={showIssue} onClose={() => setShowIssue(false)} onConfirm={onIssue} isLoading={issueM.isPending} />
      <CancelDialog isOpen={showCancel} onClose={() => setShowCancel(false)} onConfirm={onCancel} isLoading={cancelM.isPending} />
      <PaymentDialog isOpen={showPayment} onClose={() => setShowPayment(false)} invoiceId={invoice.id} balance={invoice.balance} issueDate={invoice.issueDate} onSuccess={refetch} />
    </div>
  );
}

export default InvoiceActionBar;
