import { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Forms';

export interface CancelDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  isLoading?: boolean;
}

export function CancelDialog({ isOpen, onClose, onConfirm, isLoading }: CancelDialogProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = reason.trim();
    if (trimmed.length < 5) {
      setError('Cancel reason must be at least 5 characters');
      return;
    }
    setError(null);
    await onConfirm(trimmed);
    handleClose();
  };

  const handleClose = () => {
    setReason('');
    setError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Cancel Invoice">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', color: '#991b1b' }}>
          <strong>Warning:</strong> Any existing payments must be voided before cancelling this invoice.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <label htmlFor="cancelReason" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>
            Cancellation Reason (min 5 chars)
          </label>
          <textarea
            id="cancelReason"
            rows={3}
            value={reason}
            onChange={(e) => { setReason(e.target.value); if (e.target.value.trim().length >= 5) setError(null); }}
            placeholder="e.g. Scope adjusted or milestone re-negotiated..."
            style={{
              padding: '0.6rem 0.75rem', borderRadius: '6px', fontSize: '0.875rem',
              border: `1px solid ${error ? '#dc2626' : '#cbd5e1'}`, outline: 'none', resize: 'vertical',
            }}
          />
          {error && <span role="alert" style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 500 }}>{error}</span>}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <Button type="button" variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="danger" disabled={isLoading || reason.trim().length < 5}>
            {isLoading ? 'Cancelling...' : 'Confirm Cancellation'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default CancelDialog;
