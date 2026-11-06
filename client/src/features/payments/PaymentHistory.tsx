import { useState } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { Button } from '../../components/ui/Forms';
import { Table, type Column } from '../../components/ui/Table';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useInvoicePayments, type PaymentRecord } from './hooks';
import { VoidPaymentDialog } from './VoidPaymentDialog';

export function PaymentHistory({ invoiceId, onPaymentVoided }: { invoiceId: string; onPaymentVoided?: () => void }) {
  const { user } = useAuth();
  const { data, isLoading } = useInvoicePayments(invoiceId);
  const [voidPaymentId, setVoidPaymentId] = useState<string | null>(null);

  const isManager = user?.role === 'ADMIN' || user?.role === 'MANAGER';
  const payments = data?.data || [];

  const columns: Column<PaymentRecord>[] = [
    { key: 'date', label: 'Date', render: (p) => p.paymentDate || (p as any).date },
    { key: 'method', label: 'Method', render: (p) => (p.method || '').replace('_', ' ') },
    {
      key: 'reference',
      label: 'Reference',
      render: (p) => (
        <div>
          <span>{p.reference || '-'}</span>
          {p.status === 'VOIDED' && (p.voidReason || (p as any).void_reason) && (
            <div style={{ fontSize: '0.75rem', color: '#dc2626' }}>
              Void reason: {p.voidReason || (p as any).void_reason}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (p) => (
        <span
          className={p.status === 'VOIDED' ? 'line-through text-gray-500' : ''}
          style={{
            textDecoration: p.status === 'VOIDED' ? 'line-through' : 'none',
            color: p.status === 'VOIDED' ? '#64748b' : 'inherit',
            fontWeight: 600,
          }}
        >
          ${Number(p.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      ),
    },
    { key: 'status', label: 'Status', render: (p) => <StatusBadge status={p.status} /> },
  ];

  if (isManager) {
    columns.push({
      key: 'actions',
      label: 'Actions',
      render: (p) =>
        p.status === 'ACTIVE' ? (
          <Button
            type="button"
            variant="danger"
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
            onClick={() => setVoidPaymentId(p.id)}
            data-testid={`void-pay-btn-${p.id}`}
          >
            Void
          </Button>
        ) : null,
    });
  }

  return (
    <div data-testid="payments-table">
      <Table columns={columns} data={payments} isLoading={isLoading} emptyText="No payments recorded yet." />
      <VoidPaymentDialog
        isOpen={Boolean(voidPaymentId)}
        onClose={() => setVoidPaymentId(null)}
        paymentId={voidPaymentId}
        invoiceId={invoiceId}
        onSuccess={onPaymentVoided}
      />
    </div>
  );
}

export const PaymentHistoryTable = PaymentHistory;
export default PaymentHistory;
