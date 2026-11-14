import { useState } from 'react';
import { Download, Plus } from 'lucide-react';
import { ExpensesList } from '../features/expenses/ExpensesList';
import { ExpenseForm } from '../features/expenses/ExpenseForm';
import { ExpenseStatsCards } from '../features/expenses/ExpenseStatsCards';
import { downloadAllExpensesCsv } from '../features/expenses/exportExpenses';
import { useExpenses } from '../features/expenses/hooks';

export function ExpensesPage() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { data } = useExpenses();
  const expenses = data?.data || [];

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await downloadAllExpensesCsv(expenses);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <span>Operations &amp; Delivery</span>
            <span>&rsaquo;</span>
            <span className="text-slate-600 font-medium">Expenses</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Expenses</h1>
          <p className="mt-0.5 text-xs text-slate-500">Track and manage project-related operational expenses, billable costs, and category allocations</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-2xs transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            {isExporting ? 'Exporting...' : 'Export CSV'}
          </button>
          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            data-testid="add-expense-btn"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-500/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Expense
          </button>
        </div>
      </div>

      <ExpenseStatsCards expenses={expenses} />
      <ExpensesList />
      <ExpenseForm isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
    </div>
  );
}

export default ExpensesPage;
