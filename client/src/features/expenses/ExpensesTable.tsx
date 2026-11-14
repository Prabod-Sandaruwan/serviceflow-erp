import type { Expense } from './types';

interface ExpensesTableProps {
  expenses: Expense[];
  onEdit: (e: Expense) => void;
  onVoid: (id: string) => void;
}

const CAT_COLORS: Record<string, string> = {
  SOFTWARE_LICENSE: 'bg-blue-50 text-blue-700 border-blue-200',
  HOSTING_INFRASTRUCTURE: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  THIRD_PARTY_SERVICE: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  TRAVEL: 'bg-amber-50 text-amber-700 border-amber-200',
  SUBCONTRACTOR: 'bg-purple-50 text-purple-700 border-purple-200',
  MATERIALS: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  EQUIPMENT: 'bg-teal-50 text-teal-700 border-teal-200',
  OTHER: 'bg-slate-50 text-slate-700 border-slate-200',
};

export function ExpensesTable({ expenses, onEdit, onVoid }: ExpensesTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200/80 bg-white shadow-2xs">
      <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
        <thead className="bg-slate-50/75 text-slate-500 font-bold tracking-wider uppercase text-[10px]">
          <tr>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Description</th>
            <th className="px-4 py-3">Amount</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200/70 bg-white">
          {expenses.map((e) => {
            const isVoided = e.status === 'VOIDED';
            const catCls = CAT_COLORS[e.category] || CAT_COLORS.OTHER;
            return (
              <tr key={e.id} className={isVoided ? 'bg-slate-50/60 text-gray-500 hover:bg-slate-50' : 'text-slate-900 hover:bg-slate-50/50 transition'} data-testid={`expense-row-${e.id}`}>
                <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-600">{(e.expenseDate || e.expense_date || '').slice(0, 10)}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${catCls}`}>
                    {e.category.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="font-semibold text-slate-800">{e.description}</div>
                  {e.supplier && <div className="text-[11px] text-slate-400">Supplier: {e.supplier}</div>}
                </td>
                <td className={`px-4 py-3 font-mono font-medium ${isVoided ? 'line-through text-gray-500' : 'text-slate-900 font-bold'}`} data-testid={`expense-amount-${e.id}`}>
                  ${Number(e.amount).toFixed(2)}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold ${isVoided ? 'bg-slate-100 text-slate-500 border border-slate-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                    {e.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  {!isVoided && (
                    <div className="flex justify-end gap-3">
                      <button onClick={() => onEdit(e)} className="font-semibold text-blue-600 hover:text-blue-800 transition cursor-pointer" data-testid={`edit-btn-${e.id}`}>Edit</button>
                      <button onClick={() => onVoid(e.id)} className="font-semibold text-rose-600 hover:text-rose-800 transition cursor-pointer" data-testid={`void-btn-${e.id}`}>Void</button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default ExpensesTable;
