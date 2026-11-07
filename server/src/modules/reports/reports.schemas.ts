import { z } from 'zod';

export function getCurrentMonthRange() {
  const now = new Date();
  const colomboOffset = 5.5 * 60 * 60 * 1000;
  const colomboTime = new Date(now.getTime() + colomboOffset);
  const year = colomboTime.getUTCFullYear();
  const month = colomboTime.getUTCMonth();
  const startStr = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const endStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  return { from: startStr, to: endStr };
}

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const reportDateRangeSchema = z
  .object({
    from: z.string().regex(dateRegex, 'From date must be in YYYY-MM-DD format').optional(),
    to: z.string().regex(dateRegex, 'To date must be in YYYY-MM-DD format').optional(),
    projectId: z.string().optional(),
  })
  .transform((data) => {
    const def = getCurrentMonthRange();
    const from = data.from || def.from;
    const to = data.to || def.to;
    return {
      from,
      to,
      projectId: data.projectId,
      startDate: new Date(`${from}T00:00:00.000Z`),
      endDate: new Date(`${to}T23:59:59.999Z`),
    };
  })
  .refine((data) => data.startDate.getTime() <= data.endDate.getTime(), {
    message: 'From date must be on or before To date',
    path: ['from'],
  })
  .refine(
    (data) => {
      const diffMs = data.endDate.getTime() - data.startDate.getTime();
      const fiveYearsMs = 5 * 365.25 * 24 * 60 * 60 * 1000;
      return diffMs <= fiveYearsMs;
    },
    {
      message: 'Date range span must not exceed 5 years',
      path: ['to'],
    }
  );

export type ReportDateRangeQuery = z.infer<typeof reportDateRangeSchema>;
