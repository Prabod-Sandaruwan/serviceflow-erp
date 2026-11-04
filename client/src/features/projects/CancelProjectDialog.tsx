import { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Forms';

export interface CancelProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  isLoading?: boolean;
}

export function CancelProjectDialog({ isOpen, onClose, onConfirm, isLoading = false }: CancelProjectDialogProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = reason.trim();
    if (trimmed.length < 5) {
      setError('Cancellation reason must be at least 5 characters');
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
    <Modal isOpen={isOpen} onClose={handleClose} title="Cancel Project">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
          Please provide a reason for cancelling this project. This action is terminal and will be audited.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <label htmlFor="cancelReason" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#334155' }}>
            Cancellation Reason (min 5 chars)
          </label>
          <textarea
            id="cancelReason"
            rows={3}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (error && e.target.value.trim().length >= 5) setError(null);
            }}
            placeholder="Explain why the project is being cancelled..."
            style={{
              padding: '0.55rem 0.75rem',
              borderRadius: '6px',
              border: `1px solid ${error ? '#dc2626' : '#cbd5e1'}`,
              fontSize: '0.875rem',
              outline: 'none',
              resize: 'vertical',
            }}
          />
          {error && <span style={{ color: '#dc2626', fontSize: '0.75rem' }}>{error}</span>}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
          <Button type="button" variant="secondary" onClick={handleClose} disabled={isLoading}>
            Never mind
          </Button>
          <Button type="submit" variant="danger" disabled={isLoading || reason.trim().length < 5}>
            {isLoading ? 'Cancelling...' : 'Confirm Cancellation'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default CancelProjectDialog;

