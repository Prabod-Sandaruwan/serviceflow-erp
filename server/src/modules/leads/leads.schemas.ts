import { z } from 'zod';

export const leadStatusEnum = z.enum([
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'PROPOSAL_SENT',
  'CONVERTED',
  'LOST',
]);

export const leadQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  status: leadStatusEnum.optional(),
  ownerId: z.string().optional(),
  clientId: z.string().optional(),
  sort: z.enum(['createdAt', '-createdAt', 'expectedValue', '-expectedValue']).optional(),
});

export const createLeadSchema = z.object({
  ownerId: z.string().or(z.number()).optional(),
  expectedValue: z.coerce
    .number()
    .min(0, 'Expected value cannot be negative')
    .optional()
    .nullable(),
  notes: z.string().optional(),
});

export const updateLeadSchema = z
  .object({
    status: z
      .enum(['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'CONVERTED', 'LOST', 'WON'])
      .optional(),
    lostReason: z.string().trim().optional().nullable(),
    expectedValue: z.coerce
      .number()
      .min(0, 'Expected value cannot be negative')
      .optional()
      .nullable(),
    ownerId: z.string().or(z.number()).optional(),
    notes: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.status === 'LOST') {
        return !!data.lostReason && data.lostReason.trim().length > 0;
      }
      return true;
    },
    { message: 'lostReason is required when status is LOST', path: ['lostReason'] }
  );

export const convertLeadSchema = z.object({
  existingClientId: z.string().optional(),
});

export type LeadQuery = z.infer<typeof leadQuerySchema>;
export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
export type ConvertLeadInput = z.infer<typeof convertLeadSchema>;
