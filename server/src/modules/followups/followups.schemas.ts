import { z } from 'zod';
import { getColomboToday } from '../../lib/date';

export const followUpStatusEnum = z.enum(['PENDING', 'DONE']);

export const followUpQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  leadId: z.string().optional(),
  status: followUpStatusEnum.optional(),
  overdue: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .or(z.boolean())
    .optional(),
});

export const createFollowUpSchema = z
  .object({
    leadId: z.string().min(1, 'Lead ID is required'),
    scheduledAt: z.coerce.date(),
    notes: z.string().optional(),
    type: z.enum(['CALL', 'EMAIL', 'MEETING', 'OTHER']).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.scheduledAt < getColomboToday()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'A PENDING follow-up cannot be scheduled before today',
        path: ['scheduledAt'],
      });
    }
  });

export const updateFollowUpSchema = z
  .object({
    leadId: z.string().min(1).optional(),
    scheduledAt: z.coerce.date().optional(),
    notes: z.string().optional(),
    status: followUpStatusEnum.optional(),
    type: z.enum(['CALL', 'EMAIL', 'MEETING', 'OTHER']).optional(),
  })
  .superRefine((data, ctx) => {
    const status = data.status ?? 'PENDING';
    if (status === 'PENDING' && data.scheduledAt && data.scheduledAt < getColomboToday()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'A PENDING follow-up cannot be scheduled before today',
        path: ['scheduledAt'],
      });
    }
  });

export type FollowUpQuery = z.infer<typeof followUpQuerySchema>;
export type CreateFollowUpInput = z.infer<typeof createFollowUpSchema>;
export type UpdateFollowUpInput = z.infer<typeof updateFollowUpSchema>;
