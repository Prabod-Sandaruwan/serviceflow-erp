import { api } from "../../lib/api";
import { downloadCsv } from "../../lib/csv";
import type { Expense, ExpensesResponse } from "./types";

export async function downloadAllExpensesCsv(fallbackExpenses: Expense[] = []) {
  let list = fallbackExpenses;
  try {
    const res = await api.get<ExpensesResponse>("/expenses");
    if (res?.data && res.data.length > 0) {
      list = [...res.data];
    }
  } catch {
    // use fallback
  }

  const headers = [
    "Expense ID",
    "Date",
    "Project ID",
    "Category",
    "Description",
    "Supplier",
    "Amount",
    "Status",
  ];
  const rows = list.map((e) => [
    e.id,
    e.expenseDate || e.expense_date || "",
    e.projectId || e.project_id || "",
    e.category,
    e.description,
    e.supplier || "-",
    Number(e.amount).toFixed(2),
    e.status,
  ]);

  downloadCsv(
    `expenses_export_${new Date().toISOString().slice(0, 10)}.csv`,
    headers,
    rows,
  );
}

export default downloadAllExpensesCsv;
