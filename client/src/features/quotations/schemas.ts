import { z } from 'zod';

export const quotationItemSchema = z.object({
  description: z.string().trim().min(1, 'Item description is required').max(255),
  quantity: z
    .string()
    .trim()
    .min(1, 'Quantity is required')
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, 'Quantity must be greater than 0'),
  unitPrice: z
    .string()
    .trim()
    .min(1, 'Unit price is required')
    .refine((v) => !isNaN(Number(v)) && Number(v) >= 0, 'Unit price cannot be negative'),
});

export const quotationFormSchema = z.object({
  clientId: z.string().trim().min(1, 'Client is required'),
  leadId: z.string().optional(),
  title: z.string().trim().min(1, 'Title is required').max(160, 'Title cannot exceed 160 characters'),
  validUntil: z.string().min(1, 'Valid until date is required'),
  taxAmount: z
    .string()
    .trim()
    .default('0.00')
    .refine((v) => !v || (!isNaN(Number(v)) && Number(v) >= 0), 'Tax amount cannot be negative'),
  notes: z.string().optional(),
  items: z.array(quotationItemSchema).min(1, 'Quotation must have at least one item'),
});

export type QuotationItemFormData = z.infer<typeof quotationItemSchema>;
export type QuotationFormData = z.infer<typeof quotationFormSchema>;
