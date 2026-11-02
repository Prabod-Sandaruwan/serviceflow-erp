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
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Quotation must have at least one item', path: ['items'] });
    }
    if (data.validUntil && data.validUntil < getColomboToday()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'validUntil cannot be before today', path: ['validUntil'] });
    }
  });

export const updateQuotationSchema = z
  .object({
    title: z.string().trim().min(1).max(160).optional(),
    validUntil: z.coerce.date().optional(),
    items: z.array(quotationItemInputSchema).optional(),
    tax: quotationTaxSchema.optional(),
    notes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.items !== undefined && data.items.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Quotation must have at least one item', path: ['items'] });
    }
    if (data.validUntil && data.validUntil < getColomboToday()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'validUntil cannot be before today', path: ['validUntil'] });
    }
  });

export const rejectQuotationSchema = z.object({
  reason: z.string().trim().min(5, 'Rejection reason must be at least 5 characters').max(500),
});

export const respondQuotationSchema = z.object({
  outcome: z.enum(['ACCEPTED', 'DECLINED']),
  date: z.string().date(),
  note: z.string().trim().max(500).optional(),
});

export const quotationStatusEnum = z.enum([
  'DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'SENT', 'ACCEPTED', 'DECLINED',
]);

export const listQuotationsQuerySchema = z.object({
  status: quotationStatusEnum.optional(),
  clientId: z.string().optional(),
  createdBy: z.string().optional(),
  pendingApproval: z.enum(['true', 'false']).transform((v) => v === 'true').or(z.boolean()).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
});

export type CreateQuotationInput = z.infer<typeof createQuotationSchema>;
export type UpdateQuotationInput = z.infer<typeof updateQuotationSchema>;
export type RejectQuotationInput = z.infer<typeof rejectQuotationSchema>;
export type RespondQuotationInput = z.infer<typeof respondQuotationSchema>;
export type QuotationItemInput = z.infer<typeof quotationItemInputSchema>;
export type ListQuotationsQuery = z.infer<typeof listQuotationsQuerySchema>;
