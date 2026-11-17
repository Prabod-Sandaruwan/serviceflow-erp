import { z } from 'zod';

export const numericAmountSchema = z
  .union([z.string(), z.number()])
  .transform((val) => String(val).trim())
  .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: 'Amount must be a non-negative number',
  });

export const invoiceStatusEnum = z.enum(['DRAFT', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'CANCELLED']);

export const createInvoiceItemSchema = z.object({
  description: z.string().min(1).max(255),
  amount: numericAmountSchema,
  quantity: z.union([z.number(), z.string()]).optional(),
  unitPrice: z.union([z.number(), z.string()]).optional(),
});

const emptyToNull = (val: unknown) => (typeof val === 'string' && val.trim() === '' ? null : val);

const taxFields = {
  taxType: z.preprocess(emptyToNull, z.string().max(20).optional().nullable()),
  taxRate: z.preprocess(emptyToNull, z.coerce.number().min(0).max(100).optional().nullable()),
  taxAmount: z.preprocess((v) => (v === '' ? '0' : v), numericAmountSchema.optional()),
  taxReference: z.preprocess(emptyToNull, z.string().max(60).optional().nullable()),
  notes: z.preprocess(emptyToNull, z.string().optional().nullable()),
  dueDate: z.preprocess(
    emptyToNull,
    z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD')
      .optional()
      .nullable()
  ),
};

export const createInvoiceSchema = z.object({
  milestoneId: z.union([z.string().min(1), z.bigint(), z.number()]),
  items: z.array(createInvoiceItemSchema).max(100, 'Invoice cannot exceed 100 items').optional(),
  ...taxFields,
  taxAmount: numericAmountSchema.optional().default('0'),
});

export const updateInvoiceSchema = z.object({
  items: z.array(createInvoiceItemSchema).max(100, 'Invoice cannot exceed 100 items').optional(),
  ...taxFields,
});

export const issueInvoiceSchema = z.object({
  issueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD'),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD'),
});

export const cancelInvoiceSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(5, 'Reason must be at least 5 characters')
    .max(500, 'Reason cannot exceed 500 characters'),
});

export const listInvoicesQuerySchema = z.object({
  status: invoiceStatusEnum.optional(),
  clientId: z.union([z.string(), z.number(), z.bigint()]).optional(),
  projectId: z.union([z.string(), z.number(), z.bigint()]).optional(),
  overdue: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .transform((v) => v === true || v === 'true')
    .optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;
export type IssueInvoiceInput = z.infer<typeof issueInvoiceSchema>;
export type CancelInvoiceInput = z.infer<typeof cancelInvoiceSchema>;
export type ListInvoicesQuery = z.infer<typeof listInvoicesQuerySchema>;
