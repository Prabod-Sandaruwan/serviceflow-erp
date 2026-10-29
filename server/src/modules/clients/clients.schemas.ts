import { z } from 'zod';

export const clientQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  search: z.string().optional(),
  type: z.string().optional(),
  isActive: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .optional(),
  sort: z.enum(['displayName', 'createdAt', '-displayName', '-createdAt']).optional(),
});

export type ClientQuery = z.infer<typeof clientQuerySchema>;

