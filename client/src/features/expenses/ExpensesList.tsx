import { useState } from 'react';
import { useExpenses, type UseExpensesFilters } from './hooks';
import { ExpenseFilters } from './ExpenseFilters';
import { ExpenseForm } from './ExpenseForm';
import { VoidExpenseDialog } from './VoidExpenseDialog';
import type { Expense } from './types';

export function ExpensesList() {
  const [filters, setFilters] = useState<UseExpensesFilters>({});
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [voidingExpenseId, setVoidingExpenseId] = useState<string | null>(null);

  const { data, isLoading } = useExpenses(filters);
  const expenses = data?.data || [];

  return (
    <div className="space-y-4">
      <ExpenseFilters filters={filters} onChange={setFilters} />

      {isLoading ? (
        <div className="p-4 text-sm text-slate-500">Loading expenses...</div>
      ) : expenses.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">No expenses found.</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-semibold">
              <tr>
                <th className="px-3 py-2.5">Date</th>
                <th className="px-3 py-2.5">Category</th>
                <th className="px-3 py-2.5">Description</th>
                <th className="px-3 py-2.5">Amount</th>
                <th className="px-3 py-2.5">Status</th>
                <th className="px-3 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {expenses.map((e) => {
                const isVoided = e.status === 'VOIDED';
                return (
                  <tr key={e.id} className={isVoided ? 'bg-slate-50 text-gray-500' : 'text-slate-900'} data-testid={`expense-row-${e.id}`}>
                    <td className="whitespace-nowrap px-3 py-2.5 text-slate-700">{(e.expenseDate || e.expense_date || '').slice(0, 10)}</td>
                    <td className="px-3 py-2.5 font-semibold text-slate-800">{e.category}</td>
                    <td className="px-3 py-2.5 text-slate-700">{e.description}</td>
                    <td className={`px-3 py-2.5 font-mono font-medium ${isVoided ? 'line-through text-gray-500' : 'text-slate-900'}`} data-testid={`expense-amount-${e.id}`}>
                      ${Number(e.amount).toFixed(2)}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${isVoided ? 'bg-slate-100 text-slate-500 border border-slate-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                        {e.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-right">
                      {!isVoided && (
                        <div className="flex justify-end gap-2">
                          <button onClick={() => setEditingExpense(e)} className="font-semibold text-indigo-600 hover:text-indigo-800 hover:underline" data-testid={`edit-btn-${e.id}`}>
                            Edit
                          </button>
                          <button onClick={() => setVoidingExpenseId(e.id)} className="font-semibold text-red-600 hover:text-red-800 hover:underline" data-testid={`void-btn-${e.id}`}>
                            Void
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ExpenseForm isOpen={Boolean(editingExpense)} onClose={() => setEditingExpense(null)} initialData={editingExpense} />
      <VoidExpenseDialog isOpen={Boolean(voidingExpenseId)} onClose={() => setVoidingExpenseId(null)} expenseId={voidingExpenseId} />
    </div>
  );
}

export default ExpensesList;
