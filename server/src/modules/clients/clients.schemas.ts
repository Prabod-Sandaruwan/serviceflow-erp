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

export const createClientSchema = z
  .object({
    clientType: z.enum(['INDIVIDUAL', 'BUSINESS', 'COMPANY']).default('COMPANY'),
    displayName: z.string().trim().min(1, 'Display name is required'),
    email: z.string().trim().email('Invalid email address').optional().or(z.literal('')),
    phone: z.string().trim().optional().or(z.literal('')),
    address: z.string().trim().optional().or(z.literal('')),
    contactPerson: z.string().trim().optional().or(z.literal('')),
    registrationNumber: z.string().trim().optional().or(z.literal('')),
    notes: z.string().trim().optional().or(z.literal('')),
  })
  .refine(
    (data) => {
      if (data.clientType === 'BUSINESS' || data.clientType === 'COMPANY') {
        return data.displayName.trim().length > 0;
      }
      return true;
    },
    { message: 'Company name is required for business clients', path: ['displayName'] }
  );

export const updateClientSchema = z
  .object({
    clientType: z.enum(['INDIVIDUAL', 'BUSINESS', 'COMPANY']).optional(),
    displayName: z.string().trim().min(1).optional(),
    email: z.string().trim().email('Invalid email address').optional().or(z.literal('')),
    phone: z.string().trim().optional().or(z.literal('')),
    address: z.string().trim().optional().or(z.literal('')),
    contactPerson: z.string().trim().optional().or(z.literal('')),
    registrationNumber: z.string().trim().optional().or(z.literal('')),
    notes: z.string().trim().optional().or(z.literal('')),
    isActive: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.clientType === 'BUSINESS' || data.clientType === 'COMPANY') {
        return !data.displayName || data.displayName.trim().length > 0;
      }
      return true;
    },
    { message: 'Company name is required for business clients', path: ['displayName'] }
  );

export type ClientQuery = z.infer<typeof clientQuerySchema>;
export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
