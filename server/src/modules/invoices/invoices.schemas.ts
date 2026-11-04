import { z } from 'zod';

export const createInvoiceItemSchema = z.object({
  description: z.string().min(1).max(255),
  amount: z.union([z.string(), z.number()]).transform(String),
  quantity: z.union([z.number(), z.string()]).optional(),
});

export const createInvoiceSchema = z.object({
  milestoneId: z.union([z.string().min(1), z.bigint(), z.number()]),
  items: z.array(createInvoiceItemSchema).optional(),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type CreateInvoiceItemInput = z.infer<typeof createInvoiceItemSchema>;

