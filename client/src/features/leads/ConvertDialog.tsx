import { useState } from 'react';
import { useConvertLead } from './hooks';
import { useClients } from '../clients/hooks';
import { Modal } from '../../components/ui/Modal';
import { Select, Button } from '../../components/ui/Forms';
import { useToast } from '../../components/ui/Toast';

export interface ConvertDialogProps {
  leadId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ConvertDialog({ leadId, isOpen, onClose }: ConvertDialogProps) {
  const [convertMode, setConvertMode] = useState<'new' | 'existing'>('new');
  const [selectedClientId, setSelectedClientId] = useState('');
  const { addToast } = useToast();
  const convertMutation = useConvertLead(leadId);
  const clientsQuery = useClients({ page: '1', limit: '100' });

  const clientOptions = [
    { value: '', label: '-- Select Existing Client --' },
    ...(clientsQuery.data?.data || []).map((c) => ({ value: c.id, label: `${c.displayName} (${c.clientType})` })),
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = convertMode === 'existing' && selectedClientId ? { existingClientId: selectedClientId } : {};
      await convertMutation.mutateAsync(payload);
      addToast('Lead successfully converted to Client!', 'success');
      onClose();
    } catch (err: any) {
      if (err?.status === 409 || err?.message?.includes('already converted') || err?.code === 'LEAD_ALREADY_CONVERTED') {
        addToast('Notice: Lead is already converted.', 'info');
        onClose();
      } else {
        addToast(err?.message || 'Failed to convert lead', 'error');
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Convert Lead to Client">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
          Convert this opportunity into an active Client account.
        </p>

        <div style={{ display: 'flex', gap: '1.5rem', padding: '0.5rem 0' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer', fontWeight: 500, color: '#1e293b' }}>
            <input type="radio" name="convertMode" checked={convertMode === 'new'} onChange={() => setConvertMode('new')} />
            Create new client
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer', fontWeight: 500, color: '#1e293b' }}>
            <input type="radio" name="convertMode" checked={convertMode === 'existing'} onChange={() => setConvertMode('existing')} />
            Link existing client
          </label>
        </div>

        {convertMode === 'existing' && (
          <Select
            id="existingClientId"
            label="Select Existing Client"
            options={clientOptions}
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            required
          />
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <Button type="button" variant="secondary" onClick={onClose} style={{ borderRadius: '8px' }}>Cancel</Button>
          <Button type="submit" disabled={convertMutation.isPending || (convertMode === 'existing' && !selectedClientId)} style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)', borderRadius: '8px', fontWeight: 600 }}>
            {convertMutation.isPending ? 'Converting...' : 'Confirm Conversion'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default ConvertDialog;
