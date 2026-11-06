import { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button, Input, Select } from '../../components/ui/Forms';
import { useToast } from '../../components/ui/Toast';
import { useRecordPayment } from './hooks';

export interface PaymentDialogProps {
  invoice?: { id: string; balance: string; issueDate?: string | null };
  invoiceId?: string;
  balance?: string;
  issueDate?: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const METHODS = [
  { value: 'CASH', label: 'Cash' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'CARD', label: 'Card' },
];

export function PaymentDialog({ isOpen, onClose, invoice, invoiceId, balance, issueDate, onSuccess }: PaymentDialogProps) {
  const targetId = invoice?.id || invoiceId || '';
  const targetBal = invoice?.balance ?? balance ?? '0.00';
  const targetIssue = invoice?.issueDate ?? issueDate;
  const today = new Date().toISOString().slice(0, 10);
  const { addToast } = useToast();
  const recordM = useRecordPayment(targetId);

  const [idempotencyKey, setIdKey] = useState('');
  const [amount, setAmount] = useState(targetBal);
  const [method, setMethod] = useState<'CASH' | 'BANK_TRANSFER' | 'CARD'>('CASH');
  const [date, setDate] = useState(today);
  const [reference, setReference] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIdKey(typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `pay-${Date.now()}`);
      setAmount(targetBal || '');
      setMethod('CASH');
      setDate(today);
      setReference('');
      setNote('');
      setError(null);
    }
  }, [isOpen, targetBal, today]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(amount);
    if (isNaN(num) || num <= 0) return setError('Amount must be strictly greater than 0');
    if (num > Number(targetBal)) return setError(`Amount cannot exceed balance of ${targetBal}`);
    if ((method === 'BANK_TRANSFER' || method === 'CARD') && !reference.trim()) {
      return setError('Reference is required for bank transfer and card payments');
    }
    if (date > today) return setError('Payment date cannot be in the future');
    if (targetIssue && date < targetIssue.slice(0, 10)) return setError('Payment date cannot precede invoice issue date');

    try {
      await recordM.mutateAsync({
        invoiceId: targetId,
        idempotencyKey,
        data: { amount: num.toFixed(2), method, date, reference: reference.trim() || undefined, note: note.trim() || undefined },
      });
      addToast('Payment recorded successfully', 'success');
      onSuccess?.();
      onClose();
    } catch (err: any) { setError(err?.message || 'Failed to record payment'); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Payment">
      <form noValidate onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>Remaining Balance: <strong>${targetBal}</strong></p>
        <Input id="pay-amount" label="Amount" type="number" step="0.01" min="0.01" max={targetBal} value={amount} onChange={(e) => { setAmount(e.target.value); setError(null); }} required />
        <Select id="pay-method" label="Payment Method" options={METHODS} value={method} onChange={(e) => { setMethod(e.target.value as any); setError(null); }} />
        {(method === 'BANK_TRANSFER' || method === 'CARD') && (
          <Input id="pay-reference" label="Transaction Reference" value={reference} onChange={(e) => { setReference(e.target.value); setError(null); }} placeholder="e.g. Wire confirmation or slip #" required />
        )}
        <Input id="pay-date" label="Payment Date" type="date" max={today} min={targetIssue ? targetIssue.slice(0, 10) : undefined} value={date} onChange={(e) => { setDate(e.target.value); setError(null); }} required />
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
export default PaymentDialog;
