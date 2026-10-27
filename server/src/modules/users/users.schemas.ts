import { z } from 'zod';
import { paginationQuerySchema } from '../../shared/schemas';

export const createUserSchema = z.object({
  body: z
    .object({
      email: z.string().trim().toLowerCase().email(),
      password: z.string().min(12, 'Password must be at least 12 characters').max(128),
      role: z.enum(['ADMIN', 'MANAGER', 'STAFF']),
      employeeId: z.union([z.string(), z.number(), z.bigint()]).optional(),
      fullName: z.string().trim().min(1).max(255).optional(),
    })
    .strict()
    .refine((data) => data.employeeId !== undefined || !!data.fullName, {
      message: 'fullName is required when employeeId is not provided',
      path: ['fullName'],
    }),
});

export type CreateUserInput = z.infer<typeof createUserSchema>['body'];

export const listUsersQuerySchema = paginationQuerySchema.extend({
  role: z.enum(['ADMIN', 'MANAGER', 'STAFF']).optional(),
  isActive: z
    .preprocess((val) => {
      if (val === 'true' || val === true) return true;
      if (val === 'false' || val === false) return false;
      return val;
    }, z.boolean().optional()),
  search: z.string().trim().optional(),
});

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
