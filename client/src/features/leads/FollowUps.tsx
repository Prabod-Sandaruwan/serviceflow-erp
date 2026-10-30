import { useState } from 'react';
import { useFollowUps, useCreateFollowUp, useUpdateFollowUp } from './hooks';
import { Button, Input } from '../../components/ui/Forms';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useToast } from '../../components/ui/Toast';

export function FollowUps({ leadId }: { leadId: string }) {
  const { data, isLoading } = useFollowUps(leadId);
  const createMutation = useCreateFollowUp();
  const updateMutation = useUpdateFollowUp();
  const { addToast } = useToast();

  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return;
    try {
      await createMutation.mutateAsync({
        leadId,
        scheduledAt: new Date(date).toISOString(),
        notes: notes.trim() || undefined,
      });
      setDate('');
      setNotes('');
      addToast('Follow-up scheduled', 'success');
    } catch (err: any) {
      addToast(err?.message || 'Failed to schedule follow-up', 'error');
    }
  };

  const handleMarkDone = async (id: string) => {
    try {
      await updateMutation.mutateAsync({ id, status: 'DONE' });
      addToast('Follow-up marked as completed', 'success');
    } catch (err: any) {
      addToast(err?.message || 'Failed to update follow-up', 'error');
    }
  };

  const items = data?.data || [];

  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 2px 8px -2px rgba(15, 23, 42, 0.04)' }}>
      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: '0 0 1rem' }}>Follow-ups & Activities</h3>

      <form onSubmit={handleCreate} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'flex-end', background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
        <div style={{ flex: '1 1 200px' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: '0.25rem' }}>Schedule Date & Time</label>
          <input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} required style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }} />
        </div>
        <div style={{ flex: '2 1 280px' }}>
          <Input id="notes" placeholder="Call / meeting notes..." value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <Button type="submit" disabled={createMutation.isPending || !date} style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)', borderRadius: '8px', fontWeight: 600, height: '38px', marginBottom: '2px' }}>
          {createMutation.isPending ? 'Scheduling...' : '+ Schedule'}
        </Button>
      </form>

      {isLoading ? (
        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Loading follow-ups...</div>
      ) : items.length === 0 ? (
        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>No follow-up activities recorded yet.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {items.map((f) => (
            <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.85rem 1rem', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>{new Date(f.scheduledAt).toLocaleString()}</span>
                  <StatusBadge status={f.status} />
                  {f.isOverdue && (
                    <span style={{ padding: '0.2rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
                      Overdue
                    </span>
                  )}
                </div>
                {f.notes && <div style={{ fontSize: '0.85rem', color: '#475569' }}>{f.notes}</div>}
              </div>
              {f.status === 'PENDING' && (
                <Button type="button" variant="secondary" onClick={() => handleMarkDone(f.id)} disabled={updateMutation.isPending} style={{ fontSize: '0.8rem', padding: '0.3rem 0.65rem', borderRadius: '6px' }}>
                  Mark Done
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FollowUps;
