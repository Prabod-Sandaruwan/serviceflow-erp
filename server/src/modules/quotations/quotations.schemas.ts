import { z } from 'zod';
import { getColomboToday } from '../../lib/date';

export const quotationItemInputSchema = z.object({
  description: z.string().trim().min(1, 'Item description is required').max(255),
  quantity: z.number().positive('Quantity must be greater than 0'),
  unitPrice: z.number().min(0, 'Unit price cannot be negative'),
});

export const quotationTaxSchema = z.object({
  type: z.string().default('NONE'),
  rate: z.number().min(0).default(0),
  amount: z.number().min(0).default(0),
  reference: z.string().optional(),
});

export const createQuotationSchema = z
  .object({
    clientId: z.string().min(1, 'Client ID is required'),
    leadId: z.string().optional(),
    title: z.string().trim().min(1, 'Title is required').max(160),
    validUntil: z.coerce.date(),
    items: z.array(quotationItemInputSchema).default([]),
    tax: quotationTaxSchema.default({ type: 'NONE', rate: 0, amount: 0 }),
    notes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.items || data.items.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Quotation must have at least one item',
        path: ['items'],
      });
    }
    const today = getColomboToday();
    if (data.validUntil && data.validUntil < today) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'validUntil cannot be before today',
        path: ['validUntil'],
      });
    }
  });

export type CreateQuotationInput = z.infer<typeof createQuotationSchema>;
export type QuotationItemInput = z.infer<typeof quotationItemInputSchema>;
export type QuotationTaxInput = z.infer<typeof quotationTaxSchema>;
