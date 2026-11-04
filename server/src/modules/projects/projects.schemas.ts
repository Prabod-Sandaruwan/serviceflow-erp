import { z } from 'zod';

export const projectStatusEnum = z.enum([
  'PLANNED', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED',
]);

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

export const updateProjectSchema = z
  .object({
    status: projectStatusEnum.optional(),
    reason: z.string().trim().max(500).optional(),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD').optional(),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD').optional(),
  })
  .superRefine((data, ctx) => {
    if (data.startDate && data.endDate && new Date(data.endDate) < new Date(data.startDate)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'End date must not precede start date',
        path: ['endDate'],
      });
    }
    if (data.status === 'CANCELLED') {
      if (!data.reason || data.reason.trim().length < 5) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Cancellation reason is required and must be at least 5 characters',
          path: ['reason'],
        });
      }
    }
  });

export const listProjectsQuerySchema = z.object({
  status: projectStatusEnum.optional(),
  clientId: z.string().optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ListProjectsQuery = z.infer<typeof listProjectsQuerySchema>;
