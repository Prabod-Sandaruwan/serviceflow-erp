import { z } from 'zod';

export const leadFormSchema = z
  .object({
    title: z.string().optional(),
    clientId: z.string().optional(),
    estimatedValue: z.coerce.number().min(0, 'Value must be positive').optional().nullable(),
    status: z.string().default('NEW'),
    lostReason: z.string().optional().nullable(),
    notes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.status === 'LOST' && (!data.lostReason || !data.lostReason.trim())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Lost reason is required when status is LOST',
        path: ['lostReason'],
      });
    }
  });

export type LeadFormData = z.infer<typeof leadFormSchema>;

export const TRANSITIONS: Record<string, string[]> = {
  NEW: ['NEW', 'CONTACTED', 'LOST'],
  CONTACTED: ['CONTACTED', 'QUALIFIED', 'LOST'],
  QUALIFIED: ['QUALIFIED', 'PROPOSAL_SENT', 'LOST'],
  PROPOSAL_SENT: ['PROPOSAL_SENT', 'LOST'],
  CONVERTED: ['CONVERTED'],
  LOST: ['LOST'],
};

export const STATUS_LABELS: Record<string, string> = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  QUALIFIED: 'Qualified',
  PROPOSAL_SENT: 'Proposal Sent',
  CONVERTED: 'Converted',
  LOST: 'Lost',
};

export function getValidNextStatuses(current?: string): { value: string; label: string }[] {
  if (!current) return [{ value: 'NEW', label: 'New' }];
  const next = TRANSITIONS[current] || [current];
  return next
    .filter((s) => s !== 'WON' && (s === current || s !== 'CONVERTED'))
    .map((s) => ({ value: s, label: STATUS_LABELS[s] || s }));
}
