import { useState } from 'react';
import { ExpensesList } from '../features/expenses/ExpensesList';
import { ExpenseForm } from '../features/expenses/ExpenseForm';

export function ExpensesPage() {
  const [isAddOpen, setIsAddOpen] = useState(false);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Expenses</h1>
          <p className="text-sm text-slate-500">Track and manage project-related operational expenses.</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
          data-testid="add-expense-btn"
        >
          Add Expense
        </button>
      </div>

      <ExpensesList />

      <ExpenseForm isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
    </div>
  );
}

export default ExpensesPage;
