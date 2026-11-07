import { z } from 'zod';

export const expenseCategoryEnum = z.enum([
  'TRAVEL',
  'SOFTWARE',
  'SOFTWARE_LICENSE',
  'SUBCONTRACTOR',
  'MATERIALS',
  'EQUIPMENT',
  'HOSTING_INFRASTRUCTURE',
  'THIRD_PARTY_SERVICE',
  'OTHER',
]);

const amountSchema = z
  .union([z.string(), z.number()])
  .refine(
    (v) => {
      const s = String(v).trim();
      if (!/^\d+(\.\d{1,2})?$/.test(s)) return false;
      const n = Number(s);
      return !isNaN(n) && n > 0;
    },
    { message: 'Amount must be strictly greater than 0' }
  )
  .transform((v) => Number(v).toFixed(2));

const dateSchema = z.string().min(1, 'Expense date is required').refine(
  (val) => !isNaN(Date.parse(val)),
  { message: 'Invalid expense date' }
);

export const createExpenseSchema = z
  .object({
    projectId: z.union([z.string(), z.number(), z.bigint()]).optional(),
    project_id: z.union([z.string(), z.number(), z.bigint()]).optional(),
    category: expenseCategoryEnum,
    amount: amountSchema,
    expenseDate: dateSchema.optional(),
    expense_date: dateSchema.optional(),
    description: z.string().trim().min(3, 'Description must be at least 3 characters').max(255),
    supplier: z.string().trim().max(120).optional().nullable(),
  })
  .refine((data) => Boolean(data.projectId ?? data.project_id), {
    message: 'Project ID is required',
    path: ['project_id'],
  })
  .refine((data) => Boolean(data.expenseDate ?? data.expense_date), {
    message: 'Expense date is required',
    path: ['expense_date'],
  })
  .transform((data) => ({
    projectId: String(data.projectId ?? data.project_id),
    category: data.category,
    amount: data.amount,
    expenseDate: (data.expenseDate ?? data.expense_date)!,
    description: data.description,
    supplier: data.supplier ?? undefined,
  }));

export const updateExpenseSchema = z
  .object({
    category: expenseCategoryEnum.optional(),
    amount: amountSchema.optional(),
    expenseDate: dateSchema.optional(),
    expense_date: dateSchema.optional(),
    description: z.string().trim().min(3).max(255).optional(),
    supplier: z.string().trim().max(120).optional().nullable(),
  })
  .transform((data) => ({
    category: data.category,
    amount: data.amount,
    expenseDate: data.expenseDate ?? data.expense_date,
    description: data.description,
    supplier: data.supplier ?? undefined,
  }));

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
