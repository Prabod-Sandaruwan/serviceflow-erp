export { createExpense, updateExpense } from './expenses.mutate';
export { voidExpense } from './expenses.void';
export { listExpenses } from './expenses.list';

import { createExpense, updateExpense } from './expenses.mutate';
import { voidExpense } from './expenses.void';
import { listExpenses } from './expenses.list';

export const ExpensesService = {
  createExpense,
  updateExpense,
  voidExpense,
  listExpenses,
};

export default ExpensesService;
