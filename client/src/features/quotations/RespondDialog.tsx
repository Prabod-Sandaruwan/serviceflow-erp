import { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button, Input, Select } from '../../components/ui/Forms';

export interface RespondDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { outcome: 'ACCEPTED' | 'DECLINED'; date: string; note?: string }) => Promise<void>;
  isLoading?: boolean;
}

export function RespondDialog({ isOpen, onClose, onConfirm, isLoading = false }: RespondDialogProps) {
  const [outcome, setOutcome] = useState<'ACCEPTED' | 'DECLINED'>('ACCEPTED');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onConfirm({ outcome, date, note: note.trim() || undefined });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Client Response">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
        <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
          Record the client's formal decision regarding this quotation.
        </p>

        <Select
          id="clientOutcome"
          label="Client Decision"
          value={outcome}
          options={[
            { value: 'ACCEPTED', label: 'Accepted (Client approved quotation)' },
            { value: 'DECLINED', label: 'Declined (Client rejected quotation)' },
          ]}
          onChange={(e) => setOutcome(e.target.value as 'ACCEPTED' | 'DECLINED')}
        />

        <Input
          id="responseDate"
          label="Response Date"
          type="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <Input
          id="responseNote"
          label="Notes (Optional)"
          placeholder="Client comments, PO reference, or reason..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <Button type="button" variant="secondary" onClick={onClose} style={{ borderRadius: '8px' }}>Cancel</Button>
          <Button
            type="submit"
            disabled={isLoading || !date}
            style={{
              background: outcome === 'ACCEPTED' ? '#16a34a' : '#dc2626',
              borderRadius: '8px',
              fontWeight: 600,
            }}
          >
            {isLoading ? 'Recording...' : `Confirm ${outcome === 'ACCEPTED' ? 'Acceptance' : 'Decline'}`}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default RespondDialog;
