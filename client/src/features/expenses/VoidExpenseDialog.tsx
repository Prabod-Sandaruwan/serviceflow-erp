import React, { useState } from 'react';
import { useVoidExpense } from './hooks';

export interface VoidExpenseDialogProps {
  expenseId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function VoidExpenseDialog({ expenseId, isOpen, onClose }: VoidExpenseDialogProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const voidMutation = useVoidExpense();

  if (!isOpen || !expenseId) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim().length < 5) {
      setError('Reason must be at least 5 characters');
      return;
    }
    setError('');
    try {
      await voidMutation.mutateAsync({ id: expenseId, data: { reason: reason.trim() } });
      setReason('');
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to void expense');
    }
  };

  const handleCancel = () => {
    setError('');
    setReason('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" data-testid="void-dialog-backdrop">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-slate-800">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Void Expense</h3>
        <p className="mt-1 text-sm text-slate-500">Provide a reason for voiding this expense (minimum 5 characters).</p>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="void-reason" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Reason
            </label>
            <textarea
              id="void-reason"
              data-testid="void-reason-input"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 p-2 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              placeholder="e.g. Incurred for wrong project"
              required
            />
            {error && <p className="mt-1 text-xs text-red-500" data-testid="void-error">{error}</p>}
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={voidMutation.isPending || reason.trim().length < 5}
              className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              data-testid="confirm-void-btn"
            >
              {voidMutation.isPending ? 'Voiding...' : 'Confirm Void'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default VoidExpenseDialog;
