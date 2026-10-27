import { z } from 'zod';

export const loginSchema = z.object({
  body: z
    .object({
      email: z.string().trim().toLowerCase().email(),
      password: z.string().min(1).max(128),
    })
    .strict(),
});

export type LoginInput = z.infer<typeof loginSchema>['body'];

export const changePasswordSchema = z.object({
  body: z
    .object({
      currentPassword: z.string().min(1),
      newPassword: z.string().min(12).max(128),
    })
    .strict(),
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>['body'];
