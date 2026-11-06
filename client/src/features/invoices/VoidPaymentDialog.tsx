import { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button, Input } from '../../components/ui/Forms';
import { useToast } from '../../components/ui/Toast';
import { useVoidPayment } from './paymentHooks';

export interface VoidPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  paymentId: string | null;
  invoiceId: string;
  onSuccess?: () => void;
}

export function VoidPaymentDialog({ isOpen, onClose, paymentId, invoiceId, onSuccess }: VoidPaymentDialogProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();
  const voidM = useVoidPayment();

  const handleClose = () => {
    setReason('');
    setError(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = reason.trim();
    if (!trimmed || trimmed.length < 5) {
      setError('Void reason must be at least 5 characters');
      return;
    }
    if (trimmed.length > 500) {
      setError('Void reason cannot exceed 500 characters');
      return;
    }
    if (!paymentId) return;

    try {
      await voidM.mutateAsync({ paymentId, invoiceId, reason: trimmed });
      addToast('Payment voided successfully', 'success');
      onSuccess?.();
      handleClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to void payment');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Void Payment">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
          Voiding this payment will reverse its contribution to the invoice balance. This action cannot be undone.
        </p>
        <Input
          id="void-reason"
          label="Reason for Voiding"
          placeholder="Explain why this payment is being voided..."
          value={reason}
          onChange={(e) => { setReason(e.target.value); setError(null); }}
          error={error || undefined}
          required
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <Button type="button" variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="danger" disabled={voidM.isPending}>
            {voidM.isPending ? 'Voiding...' : 'Confirm Void'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
