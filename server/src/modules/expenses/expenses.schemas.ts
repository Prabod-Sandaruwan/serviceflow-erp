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
  .refine((v) => /^\d+(\.\d{1,2})?$/.test(String(v).trim()) && Number(v) > 0, {
    message: 'Amount must be strictly greater than 0',
  })
  .transform((v) => Number(v).toFixed(2));

const dateSchema = z
  .string()
  .min(1, 'Expense date is required')
  .refine((v) => !isNaN(Date.parse(v)), { message: 'Invalid expense date' });

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
  .refine((d) => Boolean(d.projectId ?? d.project_id), {
    message: 'Project ID is required',
    path: ['project_id'],
  })
  .refine((d) => Boolean(d.expenseDate ?? d.expense_date), {
    message: 'Expense date is required',
    path: ['expense_date'],
  })
  .transform((d) => ({
    projectId: String(d.projectId ?? d.project_id),
    category: d.category,
    amount: d.amount,
    expenseDate: (d.expenseDate ?? d.expense_date)!,
    description: d.description,
    supplier: d.supplier ?? undefined,
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
  .transform((d) => ({
    category: d.category,
    amount: d.amount,
    expenseDate: d.expenseDate ?? d.expense_date,
    description: d.description,
    supplier: d.supplier ?? undefined,
  }));

export const voidExpenseSchema = z.object({
  reason: z.string().trim().min(5, 'Reason must be at least 5 characters'),
});

const queryDate = z
  .string()
  .optional()
  .refine((v) => !v || !isNaN(Date.parse(v)), 'Invalid date');
const statusEnum = z
  .preprocess(
    (v) => (typeof v === 'string' ? v.toUpperCase() : v),
    z.enum(['ACTIVE', 'VOIDED', 'ALL'])
  )
  .default('ACTIVE');

export const listExpensesQuerySchema = z
  .object({
    projectId: z.string().optional(),
    project_id: z.string().optional(),
    category: expenseCategoryEnum.optional(),
    from: queryDate,
    to: queryDate,
    status: statusEnum,
  })
  .transform((q) => ({
    projectId: q.projectId ?? q.project_id,
    category: q.category,
    from: q.from,
    to: q.to,
    status: q.status,
  }));

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type VoidExpenseInput = z.infer<typeof voidExpenseSchema>;
export type ListExpensesQuery = z.infer<typeof listExpensesQuerySchema>;
