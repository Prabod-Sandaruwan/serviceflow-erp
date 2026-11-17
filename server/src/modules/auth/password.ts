import argon2 from 'argon2';
import { z } from 'zod';

export const ARGON2_CONFIG = {
  type: argon2.argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
} as const;

export const DUMMY_ARGON2_HASH =
  '$argon2id$v=19$m=19456,p=1,t=2$GzM+mTU+3YZJHCsgqSLewA$f9JqhQm6DmK5wRtRIIor3Hyr68ZoPCI2udBdeuqL4aI';

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: ARGON2_CONFIG.type,
    memoryCost: ARGON2_CONFIG.memoryCost,
    timeCost: ARGON2_CONFIG.timeCost,
    parallelism: ARGON2_CONFIG.parallelism,
  });
}

export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch {
    return false;
  }
}

const passwordSchema = z
  .string()
  .min(12, 'Password must be at least 12 characters')
  .max(128, 'Password must not exceed 128 characters');

export function validatePasswordPolicy(password: string, email?: string): z.ZodIssue[] {
  const issues: z.ZodIssue[] = [];
  const result = passwordSchema.safeParse(password);

  if (!result.success) {
    issues.push(...result.error.issues);
  }

  if (email && password.toLowerCase() === email.toLowerCase()) {
    issues.push({
      code: z.ZodIssueCode.custom,
      message: 'Password cannot be the same as your email address',
      path: ['password'],
    });
  }

  return issues;
}
