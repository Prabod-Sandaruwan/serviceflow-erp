import { z } from 'zod';
import { paginationQuerySchema } from '../../shared/schemas';

export const createEmployeeSchema = z.object({
  body: z
    .object({
      fullName: z.string().min(2),
      email: z.string().email().trim().toLowerCase(),
      jobTitle: z.string().min(1),
      phone: z.string().optional(),
      role: z.enum(['ADMIN', 'MANAGER', 'STAFF']).optional(),
    })
    .strict(),
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>['body'];

export const updateEmployeeSchema = z.object({
  body: z
    .object({
      fullName: z.string().min(2).optional(),
      email: z.string().email().trim().toLowerCase().optional(),
      jobTitle: z.string().min(1).optional(),
      phone: z.string().optional(),
      role: z.enum(['ADMIN', 'MANAGER', 'STAFF']).optional(),
      isActive: z.boolean().optional(),
    })
    .strict(),
});

export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>['body'];

export const listEmployeesQuerySchema = paginationQuerySchema.extend({
  isActive: z.preprocess((val) => {
    if (val === 'true' || val === true) return true;
    if (val === 'false' || val === false) return false;
    return val;
  }, z.boolean().optional()),
  search: z.string().trim().optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'STAFF']).optional(),
});

export type ListEmployeesQuery = z.infer<typeof listEmployeesQuerySchema>;
