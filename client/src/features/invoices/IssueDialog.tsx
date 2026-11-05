import { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button, Input } from '../../components/ui/Forms';

export interface IssueDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { issueDate: string; dueDate: string }) => Promise<void>;
  isLoading?: boolean;
}

export function IssueDialog({ isOpen, onClose, onConfirm, isLoading }: IssueDialogProps) {
  const today = new Date().toISOString().slice(0, 10);
  const [issueDate, setIssueDate] = useState(today);
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueDate) { setError('Issue date is required'); return; }
    if (!dueDate) { setError('Due date is required'); return; }
    if (new Date(dueDate) < new Date(issueDate)) {
      setError('Due date cannot precede issue date');
      return;
    }
    setError(null);
    await onConfirm({ issueDate, dueDate });
    handleClose();
  };

  const handleClose = () => {
    setError(null);
    setDueDate('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Issue Invoice">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
          Issuing this invoice will make it immutable and officially record its billing schedule.
        </p>
        <Input
          id="issueDate"
          label="Issue Date"
          type="date"
          value={issueDate}
          onChange={(e) => setIssueDate(e.target.value)}
          required
        />
        <Input
          id="dueDate"
          label="Due Date"
          type="date"
          min={issueDate}
          value={dueDate}
          onChange={(e) => { setDueDate(e.target.value); setError(null); }}
          error={error || undefined}
          required
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <Button type="button" variant="secondary" onClick={handleClose}>Cancel</Button>
          <Button type="submit" disabled={isLoading} style={{ background: '#4f46e5' }}>
            {isLoading ? 'Issuing...' : 'Confirm Issue'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default IssueDialog;
