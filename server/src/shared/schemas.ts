import { z } from 'zod';

export const idParamSchema = z.string().regex(/^[1-9]\d*$/, 'ID must be a positive integer');

export const moneyStringSchema = z
  .string()
  .regex(/^\d{1,12}(\.\d{1,2})?$/, 'Must be a valid money string with up to 2 decimal places');

export const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD')
  .refine((val) => {
    const [y, m, d] = val.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
  }, 'Invalid calendar date');

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
