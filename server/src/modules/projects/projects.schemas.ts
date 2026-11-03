import { z } from 'zod';

export const createProjectSchema = z
  .object({
    quotationId: z.union([z.string(), z.number(), z.bigint()]),
    name: z.string().trim().min(1).max(160).optional(),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD').optional(),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD').optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.endDate) >= new Date(data.startDate);
      }
      return true;
    },
    { message: 'End date must not precede start date', path: ['endDate'] }
  );

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

