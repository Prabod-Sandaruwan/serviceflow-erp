import { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button, Input, Select } from '../../components/ui/Forms';
import { useToast } from '../../components/ui/Toast';
import { useRecordPayment } from './paymentHooks';

export interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceId: string;
  balance: string;
  issueDate?: string | null;
  onSuccess?: () => void;
}

const METHODS = [
  { value: 'CASH', label: 'Cash' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'CARD', label: 'Card' },
];

export function PaymentDialog({ isOpen, onClose, invoiceId, balance, issueDate, onSuccess }: PaymentDialogProps) {
  const today = new Date().toISOString().slice(0, 10);
  const { addToast } = useToast();
  const recordM = useRecordPayment();

  const [amount, setAmount] = useState(balance || '');
  const [method, setMethod] = useState<'CASH' | 'BANK_TRANSFER' | 'CARD'>('CASH');
  const [date, setDate] = useState(today);
  const [reference, setReference] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setAmount(balance || '');
      setMethod('CASH');
      setDate(today);
      setReference('');
      setNote('');
      setError(null);
    }
  }, [isOpen, balance, today]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) { setError('Amount must be strictly greater than 0'); return; }
    if (numAmount > Number(balance)) { setError(`Amount cannot exceed balance of ${balance}`); return; }
    if ((method === 'BANK_TRANSFER' || method === 'CARD') && !reference.trim()) {
      setError('Reference is required for bank transfer and card payments');
      return;
    }
    if (date > today) { setError('Payment date cannot be in the future'); return; }
    if (issueDate && date < issueDate.slice(0, 10)) {
      setError('Payment date cannot precede invoice issue date');
      return;
    }

    try {
      await recordM.mutateAsync({
        invoiceId,
        data: { amount: numAmount.toFixed(2), method, date, reference: reference.trim() || undefined, note: note.trim() || undefined },
      });
      addToast('Payment recorded successfully', 'success');
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to record payment');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Payment">
      <form noValidate onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
          Remaining Balance: <strong>${balance}</strong>
        </p>
        <Input id="pay-amount" label="Amount" type="number" step="0.01" min="0.01" max={balance} value={amount} onChange={(e) => { setAmount(e.target.value); setError(null); }} required />
        <Select id="pay-method" label="Payment Method" options={METHODS} value={method} onChange={(e) => { setMethod(e.target.value as any); setError(null); }} />
        {(method === 'BANK_TRANSFER' || method === 'CARD') && (
          <Input id="pay-reference" label="Transaction Reference" value={reference} onChange={(e) => { setReference(e.target.value); setError(null); }} placeholder="e.g. Wire confirmation or slip #" required />
        )}
        <Input id="pay-date" label="Payment Date" type="date" max={today} min={issueDate ? issueDate.slice(0, 10) : undefined} value={date} onChange={(e) => { setDate(e.target.value); setError(null); }} required />
        <Input id="pay-note" label="Note (Optional)" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Internal note" />
        {error && <div style={{ color: '#dc2626', fontSize: '0.8125rem' }}>{error}</div>}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={recordM.isPending} style={{ background: '#16a34a' }}>
            {recordM.isPending ? 'Recording...' : 'Record Payment'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
