import { z } from 'zod';

export const numericAmountSchema = z
  .union([z.string(), z.number()])
  .transform((val) => String(val).trim())
  .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: 'Amount must be a non-negative number',
  });

export const invoiceStatusEnum = z.enum([
  'DRAFT', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'CANCELLED'
]);

export const createInvoiceItemSchema = z.object({
  description: z.string().min(1).max(255),
  amount: numericAmountSchema,
  quantity: z.union([z.number(), z.string()]).optional(),
  unitPrice: z.union([z.number(), z.string()]).optional(),
});

const taxFields = {
  taxType: z.string().max(20).optional().nullable(),
  taxRate: z.coerce.number().min(0).max(100).optional().nullable(),
  taxAmount: numericAmountSchema.optional(),
  taxReference: z.string().max(60).optional().nullable(),
  notes: z.string().optional().nullable(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD').optional().nullable(),
};

export const createInvoiceSchema = z.object({
  milestoneId: z.union([z.string().min(1), z.bigint(), z.number()]),
  items: z.array(createInvoiceItemSchema).optional(),
  ...taxFields,
  taxAmount: numericAmountSchema.optional().default('0'),
});

export const updateInvoiceSchema = z.object({
  items: z.array(createInvoiceItemSchema).optional(),
  ...taxFields,
});

export const issueInvoiceSchema = z.object({
  issueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD'),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD'),
});

export const cancelInvoiceSchema = z.object({
  reason: z.string().trim().min(5, 'Reason must be at least 5 characters').max(500, 'Reason cannot exceed 500 characters'),
});

export const listInvoicesQuerySchema = z.object({
  status: invoiceStatusEnum.optional(),
  clientId: z.string().optional(),
  projectId: z.string().optional(),
  overdue: z.preprocess((v) => (v === 'true' || v === true ? true : v === 'false' || v === false ? false : undefined), z.boolean().optional()),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD').optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD').optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;
export type CreateInvoiceItemInput = z.infer<typeof createInvoiceItemSchema>;
export type IssueInvoiceInput = z.infer<typeof issueInvoiceSchema>;
export type CancelInvoiceInput = z.infer<typeof cancelInvoiceSchema>;
export type ListInvoicesQuery = z.infer<typeof listInvoicesQuerySchema>;
