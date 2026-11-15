import { useState, useMemo } from 'react';
import { useExpenses } from './hooks';
import { ExpenseFilterBar } from './ExpenseFilterBar';
import { ExpensesTable } from './ExpensesTable';
import { ExpenseForm } from './ExpenseForm';
import { VoidExpenseDialog } from './VoidExpenseDialog';
import { Pagination } from '../../components/ui/Pagination';
import { Spinner } from '../../components/ui/Spinner';
import type { Expense } from './types';

export function ExpensesList() {
  const [projectId, setProjectId] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [voidingExpenseId, setVoidingExpenseId] = useState<string | null>(null);

  const queryFilters = useMemo(() => ({
    projectId: projectId || undefined,
    category: category || undefined,
    status: status || undefined,
  }), [projectId, category, status]);

  const { data, isLoading } = useExpenses(queryFilters);
  const allExpenses = data?.data || [];

  const filtered = useMemo(() => {
    if (!search.trim()) return allExpenses;
    const q = search.toLowerCase();
    return allExpenses.filter((e) =>
      (e.description && e.description.toLowerCase().includes(q)) ||
      (e.supplier && e.supplier.toLowerCase().includes(q)) ||
      (e.category && e.category.toLowerCase().includes(q))
    );
  }, [allExpenses, search]);

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleReset = () => {
    setProjectId(''); setCategory(''); setStatus(''); setSearch(''); setPage(1);
  };

  return (
    <div className="space-y-4">
      <ExpenseFilterBar
        search={search} onSearchChange={(v) => { setSearch(v); setPage(1); }}
        category={category} onCategoryChange={(v) => { setCategory(v); setPage(1); }}
        status={status} onStatusChange={(v) => { setStatus(v); setPage(1); }}
        projectId={projectId} onProjectIdChange={(v) => { setProjectId(v); setPage(1); }}
        onReset={handleReset}
      />
      {isLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white">
          <Spinner size="md" label="Loading expenses..." />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">No expenses found.</div>
      ) : (
        <>
          <ExpensesTable expenses={paginated} onEdit={setEditingExpense} onVoid={setVoidingExpenseId} />
          <div className="flex items-center justify-between px-2 text-xs text-slate-500 mt-2">
            <span>Showing <strong className="text-slate-700">{paginated.length}</strong> of <strong className="text-slate-700">{filtered.length}</strong> total expenses</span>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </>
      )}
      <ExpenseForm isOpen={Boolean(editingExpense)} onClose={() => setEditingExpense(null)} initialData={editingExpense} />
      <VoidExpenseDialog isOpen={Boolean(voidingExpenseId)} onClose={() => setVoidingExpenseId(null)} expenseId={voidingExpenseId} />
    </div>
  );
}

export default ExpensesList;
