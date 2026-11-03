import { z } from 'zod';

export const taskPriorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);
export const taskStatusEnum = z.enum(['TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED']);

export const createTaskSchema = z.object({
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().max(2000).optional().nullable(),
  assigneeId: z.union([z.string(), z.number(), z.bigint()]).optional().nullable(),
  priority: taskPriorityEnum.optional().default('MEDIUM'),
  milestoneId: z.union([z.string(), z.number(), z.bigint()]).optional().nullable(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD').optional().nullable(),
});

export const updateTaskSchema = z.object({
  title: z.string().trim().min(1).max(160).optional(),
  description: z.string().trim().max(2000).optional().nullable(),
  assigneeId: z.union([z.string(), z.number(), z.bigint()]).optional().nullable(),
  priority: taskPriorityEnum.optional(),
  milestoneId: z.union([z.string(), z.number(), z.bigint()]).optional().nullable(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD').optional().nullable(),
  status: taskStatusEnum.optional(),
});

export const listTasksQuerySchema = z.object({
  projectId: z.union([z.string(), z.number(), z.bigint()]).optional(),
  milestoneId: z.union([z.string(), z.number(), z.bigint()]).optional(),
  assigneeId: z.union([z.string(), z.number(), z.bigint()]).optional(),
  priority: taskPriorityEnum.optional(),
  status: taskStatusEnum.optional(),
  overdue: z
    .union([z.boolean(), z.enum(['true', 'false'])])
    .transform((val) => val === true || val === 'true')
    .optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>;
