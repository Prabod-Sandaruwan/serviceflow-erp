import { z } from 'zod';

export const clientSchema = z
  .object({
    clientType: z.enum(['INDIVIDUAL', 'BUSINESS']).default('BUSINESS'),
    displayName: z.string().trim().min(1, 'Display name is required'),
    email: z.string().trim().email('Invalid email address').optional().or(z.literal('')),
    phone: z.string().trim().optional(),
    address: z.string().trim().optional(),
    contactPerson: z.string().trim().optional(),
    registrationNumber: z.string().trim().optional(),
  })
  .refine(
    (data) => {
      if (data.clientType === 'BUSINESS') {
        return data.displayName.trim().length > 0;
      }
      return true;
    },
    { message: 'Company name is required for business clients', path: ['displayName'] },
  );

export type ClientFormData = z.infer<typeof clientSchema>;

