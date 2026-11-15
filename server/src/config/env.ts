import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  DATABASE_URL: z.string().min(1).optional(),
  SESSION_SECRET: z.string().min(1).default('development_secret_key_change_in_production'),
  COMPANY_NAME: z.string().optional().default(''),
  COMPANY_ADDRESS: z.string().optional().default(''),
  COMPANY_PHONE: z.string().optional().default(''),
  COMPANY_EMAIL: z.string().optional().default(''),
  COMPANY_WEBSITE: z.string().optional().default(''),
});

const parseEnv = () => {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error('Invalid environment variables:', parsed.error.format());
    throw new Error('Environment configuration validation failed');
  }
  return parsed.data;
};

export const env = parseEnv();
export default env;
