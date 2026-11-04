import { z } from 'zod';

export const numericAmountSchema = z
  .union([z.string(), z.number()])
  .transform((val) => String(val).trim())
  .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: 'Amount must be a non-negative number',
  });

export const createInvoiceItemSchema = z.object({
  description: z.string().min(1).max(255),
  amount: numericAmountSchema,
  quantity: z.union([z.number(), z.string()]).optional(),
  unitPrice: z.union([z.number(), z.string()]).optional(),
});

const taxFields = {
  taxType: z.string().max(20).optional().nullable(),
  taxRate: z.coerce.number().min(0).max(100).optional().nullable(),
  taxAmount: numericAmountSchema.optional().default('0'),
  taxReference: z.string().max(60).optional().nullable(),
  notes: z.string().optional().nullable(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD').optional().nullable(),
};

export const createInvoiceSchema = z.object({
  milestoneId: z.union([z.string().min(1), z.bigint(), z.number()]),
  items: z.array(createInvoiceItemSchema).optional(),
  ...taxFields,
});

export const updateInvoiceSchema = z.object({
  items: z.array(createInvoiceItemSchema).optional(),
  ...taxFields,
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;
export type CreateInvoiceItemInput = z.infer<typeof createInvoiceItemSchema>;
