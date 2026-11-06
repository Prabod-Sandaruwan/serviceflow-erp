import { z } from 'zod';

export const recordPaymentSchema = z
  .object({
    amount: z
      .union([z.string(), z.number()])
      .refine(
        (v) => {
          const n = Number(v);
          return !isNaN(n) && n > 0;
        },
        { message: 'Amount must be strictly greater than 0' }
      )
      .transform((v) => Number(v).toFixed(2)),
    method: z.enum(['CASH', 'BANK_TRANSFER', 'CARD']),
    date: z.string().min(1, 'Payment date is required'),
    reference: z.string().max(80).optional().nullable(),
    note: z.string().max(500).optional().nullable(),
    idempotencyKey: z.string().max(64).optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if ((data.method === 'BANK_TRANSFER' || data.method === 'CARD') && (!data.reference || !data.reference.trim())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Reference is required for bank transfer and card payments',
        path: ['reference'],
      });
    }
    if (data.date) {
      const d = new Date(data.date);
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);
      if (d > todayEnd) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Payment date cannot be in the future',
          path: ['date'],
        });
      }
    }
  });

export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;
