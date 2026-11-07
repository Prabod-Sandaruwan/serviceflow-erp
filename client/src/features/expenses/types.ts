export type ExpenseCategory =
  | 'SOFTWARE_LICENSE'
  | 'HOSTING_INFRASTRUCTURE'
  | 'THIRD_PARTY_SERVICE'
  | 'TRAVEL'
  | 'SUBCONTRACTOR'
  | 'MATERIALS'
  | 'EQUIPMENT'
  | 'OTHER';

export const EXPENSE_CATEGORIES: { label: string; value: ExpenseCategory }[] = [
  { label: 'Software License', value: 'SOFTWARE_LICENSE' },
  { label: 'Hosting & Infrastructure', value: 'HOSTING_INFRASTRUCTURE' },
  { label: 'Third Party Service', value: 'THIRD_PARTY_SERVICE' },
  { label: 'Travel', value: 'TRAVEL' },
  { label: 'Subcontractor', value: 'SUBCONTRACTOR' },
  { label: 'Materials', value: 'MATERIALS' },
  { label: 'Equipment', value: 'EQUIPMENT' },
  { label: 'Other', value: 'OTHER' },
];

export interface Expense {
  id: string;
  projectId: string;
  project_id?: string;
  category: ExpenseCategory;
  amount: string;
  expenseDate: string;
  expense_date?: string;
  description: string;
  supplier?: string | null;
  status: 'ACTIVE' | 'VOIDED';
  recordedBy?: string;
  voidedBy?: string | null;
  voidedAt?: string | null;
  voidReason?: string | null;
  void_reason?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExpensesResponse {
  data: Expense[];
}

export interface CreateExpenseInput {
  project_id: string;
  category: ExpenseCategory;
  amount: string;
  expense_date: string;
  description: string;
  supplier?: string;
}

export interface UpdateExpenseInput {
  category?: ExpenseCategory;
  amount?: string;
  expense_date?: string;
  description?: string;
  supplier?: string;
}

export interface VoidExpenseInput {
  reason: string;
}
