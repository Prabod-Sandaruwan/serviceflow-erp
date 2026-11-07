import React, { useState, useEffect } from 'react';
import { useCreateExpense, useUpdateExpense } from './hooks';
import { useProjects } from '../projects/hooks';
import { ExpenseFormFields } from './ExpenseFormFields';
import type { Expense, ExpenseCategory } from './types';

export interface ExpenseFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Expense | null;
}

export function ExpenseForm({ isOpen, onClose, initialData }: ExpenseFormProps) {
  const isEdit = Boolean(initialData);
  const [projectId, setProjectId] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('SOFTWARE_LICENSE');
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const { data: projectsRes } = useProjects();
  const nonCancelledProjects = (projectsRes?.data || []).filter((p) => p.status !== 'CANCELLED');
  const createMut = useCreateExpense(), updateMut = useUpdateExpense();

  useEffect(() => {
    if (initialData) {
      setProjectId(String(initialData.projectId || initialData.project_id || ''));
      setCategory(initialData.category || 'SOFTWARE_LICENSE');
      setAmount(String(initialData.amount || ''));
      setExpenseDate((initialData.expenseDate || initialData.expense_date || '').slice(0, 10));
      setDescription(initialData.description || '');
    } else {
      setProjectId(''); setCategory('SOFTWARE_LICENSE'); setAmount('');
      setExpenseDate(new Date().toISOString().slice(0, 10)); setDescription('');
    }
    setError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;
  const isInactive = isEdit && initialData?.status !== 'ACTIVE';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isInactive) return;
    setError('');
    try {
      if (isEdit && initialData) {
        await updateMut.mutateAsync({ id: initialData.id, data: { category, amount, expense_date: expenseDate, description } });
      } else {
        await createMut.mutateAsync({ project_id: projectId, category, amount, expense_date: expenseDate, description });
      }
      onClose();
    } catch (err: any) { setError(err?.message || 'Failed to save expense'); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-slate-800">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{isEdit ? 'Edit Expense' : 'Add Expense'}</h3>
        {isInactive && <p className="mt-2 text-sm text-red-500">Only ACTIVE expenses can be edited.</p>}
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <ExpenseFormFields
            projectId={projectId} setProjectId={setProjectId}
            category={category} setCategory={setCategory}
            amount={amount} setAmount={setAmount}
            expenseDate={expenseDate} setExpenseDate={setExpenseDate}
            description={description} setDescription={setDescription}
            projects={nonCancelledProjects} isEdit={isEdit} disabled={isInactive}
          />
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded border px-3 py-1.5 text-sm text-slate-700">Cancel</button>
            <button type="submit" disabled={isInactive || createMut.isPending || updateMut.isPending} className="rounded bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50">
              {isEdit ? 'Save Changes' : 'Create Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ExpenseForm;
