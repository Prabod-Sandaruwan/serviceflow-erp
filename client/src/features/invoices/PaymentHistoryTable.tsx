import { useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { Button } from '../../components/ui/Forms';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useInvoicePayments, type PaymentRecord } from './paymentHooks';
import { VoidPaymentDialog } from './VoidPaymentDialog';

const fmt = (v?: string | number) =>
  `$${Number(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function PaymentHistoryTable({ invoiceId, onPaymentVoided }: { invoiceId: string; onPaymentVoided?: () => void }) {
  const { user } = useAuth();
  const { data, isLoading } = useInvoicePayments(invoiceId);
  const [voidPaymentId, setVoidPaymentId] = useState<string | null>(null);

  const isManager = user?.role === 'ADMIN' || user?.role === 'MANAGER';
  const payments: PaymentRecord[] = data?.data || [];

  if (isLoading) {
    return <div style={{ padding: '1rem', textAlign: 'center', color: '#64748b' }}>Loading payments...</div>;
  }

  return (
    <div>
      <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }} data-testid="payments-table">
          <thead style={{ background: '#f8fafc', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '0.65rem 1rem' }}>Date</th>
              <th style={{ padding: '0.65rem 1rem' }}>Method</th>
              <th style={{ padding: '0.65rem 1rem' }}>Reference</th>
              <th style={{ padding: '0.65rem 1rem', textAlign: 'right' }}>Amount</th>
              <th style={{ padding: '0.65rem 1rem' }}>Status</th>
              {isManager && <th style={{ padding: '0.65rem 1rem', textAlign: 'right' }}>Action</th>}
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr><td colSpan={isManager ? 6 : 5} style={{ padding: '1rem', textAlign: 'center', color: '#64748b' }}>No payments recorded yet.</td></tr>
            ) : (
              payments.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9', opacity: p.status === 'VOIDED' ? 0.6 : 1 }}>
                  <td style={{ padding: '0.65rem 1rem' }}>{p.paymentDate}</td>
                  <td style={{ padding: '0.65rem 1rem' }}>{p.method.replace('_', ' ')}</td>
                  <td style={{ padding: '0.65rem 1rem' }}>
                    {p.reference || '-'}
                    {p.status === 'VOIDED' && p.voidReason && (
                      <div style={{ fontSize: '0.75rem', color: '#dc2626' }}>Void reason: {p.voidReason}</div>
                    )}
                  </td>
                  <td style={{ padding: '0.65rem 1rem', textAlign: 'right', fontWeight: 600 }}>{fmt(p.amount)}</td>
                  <td style={{ padding: '0.65rem 1rem' }}><StatusBadge status={p.status} /></td>
                  {isManager && (
                    <td style={{ padding: '0.65rem 1rem', textAlign: 'right' }}>
                      {p.status === 'ACTIVE' && (
                        <Button type="button" variant="danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => setVoidPaymentId(p.id)} data-testid={`void-pay-btn-${p.id}`}>
                          Void
                        </Button>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <VoidPaymentDialog isOpen={Boolean(voidPaymentId)} onClose={() => setVoidPaymentId(null)} paymentId={voidPaymentId} invoiceId={invoiceId} onSuccess={onPaymentVoided} />
    </div>
  );
}
