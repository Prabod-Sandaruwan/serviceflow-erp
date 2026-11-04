import { z } from 'zod';

export const milestoneStatusEnum = z.enum([
  'PENDING', 'IN_PROGRESS', 'COMPLETED', 'APPROVED', 'CANCELLED',
]);

export const billingAmountSchema = z
  .union([z.string(), z.number()])
  .transform((val) => String(val))
  .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: 'billingAmount must be a non-negative number',
  });

const dueDateSchema = z
  .union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD'), z.literal('')])
  .optional()
  .nullable();

export const createMilestoneSchema = z
  .object({
    title: z.string().trim().min(1).max(160).optional(),
    name: z.string().trim().min(1).max(160).optional(),
    description: z.string().trim().max(1000).optional().nullable(),
    dueDate: dueDateSchema,
    billingAmount: billingAmountSchema.optional().default('0'),
  })
  .refine((d) => !!(d.title || d.name), {
    message: 'Title is required',
    path: ['title'],
  });

export const updateMilestoneSchema = z.object({
  title: z.string().trim().min(1).max(160).optional(),
  name: z.string().trim().min(1).max(160).optional(),
  description: z.string().trim().max(1000).optional().nullable(),
  dueDate: dueDateSchema,
  billingAmount: billingAmountSchema.optional(),
  status: milestoneStatusEnum.optional(),
});

export type CreateMilestoneInput = z.infer<typeof createMilestoneSchema>;
export type UpdateMilestoneInput = z.infer<typeof updateMilestoneSchema>;
