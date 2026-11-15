import { z } from 'zod';
import { paginationQuerySchema } from '../../shared/schemas';

export const listAuditLogsQuerySchema = paginationQuerySchema.extend({
  entityType: z.string().trim().optional(),
  entityId: z.preprocess(
    (val) => (val === '' || val === undefined ? undefined : BigInt(val as any)),
    z.bigint().optional()
  ),
  actorId: z.preprocess(
    (val) => (val === '' || val === undefined ? undefined : BigInt(val as any)),
    z.bigint().optional()
  ),
  action: z.string().trim().optional(),
  from: z.string().trim().optional(),
  to: z.string().trim().optional(),
});

export type ListAuditLogsQuery = z.infer<typeof listAuditLogsQuerySchema>;
