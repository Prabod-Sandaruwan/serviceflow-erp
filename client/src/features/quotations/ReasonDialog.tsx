import { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Forms';

export interface ReasonDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  isLoading?: boolean;
}

export function ReasonDialog({ isOpen, onClose, onConfirm, isLoading = false }: ReasonDialogProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = reason.trim();
    if (trimmed.length < 5) {
      setError('Rejection reason must be at least 5 characters');
      return;
    }
    setError(null);
    await onConfirm(trimmed);
    setReason('');
  };

  const handleClose = () => {
    setReason('');
    setError(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Reject Quotation">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
          Please provide a reason for rejecting this quotation. The creator will be able to review this and revise.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <label htmlFor="rejectionReason" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>
            Rejection Reason (min 5 chars)
          </label>
          <textarea
            id="rejectionReason"
            rows={3}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (error && e.target.value.trim().length >= 5) setError(null);
            }}
            placeholder="e.g. Budget exceeds quarterly limit by 15%..."
            style={{
              padding: '0.6rem 0.75rem', borderRadius: '6px', fontSize: '0.875rem',
              border: `1px solid ${error ? '#dc2626' : '#cbd5e1'}`, outline: 'none', resize: 'vertical',
            }}
          />
          {error && <span role="alert" style={{ fontSize: '0.75rem', color: '#dc2626', fontWeight: 500 }}>{error}</span>}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <Button type="button" variant="secondary" onClick={handleClose} style={{ borderRadius: '8px' }}>Cancel</Button>
          <Button type="submit" variant="danger" disabled={isLoading || reason.trim().length < 5} style={{ borderRadius: '8px', fontWeight: 600 }}>
            {isLoading ? 'Rejecting...' : 'Confirm Rejection'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default ReasonDialog;
