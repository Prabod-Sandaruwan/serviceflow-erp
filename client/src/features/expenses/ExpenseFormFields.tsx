import { EXPENSE_CATEGORIES, type ExpenseCategory } from './types';

interface ExpenseFormFieldsProps {
  projectId: string;
  setProjectId: (val: string) => void;
  category: ExpenseCategory;
  setCategory: (val: ExpenseCategory) => void;
  amount: string;
  setAmount: (val: string) => void;
  expenseDate: string;
  setExpenseDate: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  projects: { id: string | bigint; name?: string | null; projectCode?: string | null }[];
  isEdit: boolean;
  disabled: boolean;
}

export function ExpenseFormFields({
  projectId, setProjectId, category, setCategory,
  amount, setAmount, expenseDate, setExpenseDate,
  description, setDescription, projects, isEdit, disabled,
}: ExpenseFormFieldsProps) {
  return (
    <>
      <div>
        <label className="block text-xs font-semibold text-slate-700">Project</label>
        <select value={projectId} onChange={(e) => setProjectId(e.target.value)} disabled={isEdit || disabled} required className="mt-1 w-full rounded border border-slate-300 bg-white p-2 text-sm text-slate-900">
          <option value="">Select project...</option>
          {projects.map((p) => <option key={String(p.id)} value={String(p.id)}>{p.name || p.projectCode || String(p.id)}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700">Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value as any)} disabled={disabled} className="mt-1 w-full rounded border border-slate-300 bg-white p-2 text-sm text-slate-900">
            {EXPENSE_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700">Amount</label>
          <input type="number" step="0.01" min="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} disabled={disabled} required className="mt-1 w-full rounded border border-slate-300 bg-white p-2 text-sm text-slate-900" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-700">Date</label>
        <input type="date" value={expenseDate} onChange={(e) => setExpenseDate(e.target.value)} disabled={disabled} required className="mt-1 w-full rounded border border-slate-300 bg-white p-2 text-sm text-slate-900" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-700">Description</label>
        <input type="text" minLength={3} maxLength={255} value={description} onChange={(e) => setDescription(e.target.value)} disabled={disabled} required className="mt-1 w-full rounded border border-slate-300 bg-white p-2 text-sm text-slate-900" />
      </div>
    </>
  );
}

export default ExpenseFormFields;
