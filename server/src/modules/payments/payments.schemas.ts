import { z } from 'zod';

export const recordPaymentSchema = z
  .object({
    amount: z
      .union([z.string(), z.number()])
      .refine(
        (v) => {
          const str = String(v).trim();
          if (!/^\d+(\.\d{1,2})?$/.test(str)) return false;
          const n = Number(str);
          return !isNaN(n) && n > 0;
        },
        { message: 'Amount must be a positive numeric string with up to 2 decimal places' }
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

export const voidPaymentSchema = z.object({
  reason: z.string().trim().min(5, 'Reason must be at least 5 characters').max(500, 'Reason cannot exceed 500 characters'),
});

export type VoidPaymentInput = z.infer<typeof voidPaymentSchema>;
