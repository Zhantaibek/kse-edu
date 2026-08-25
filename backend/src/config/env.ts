import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4100),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  TELEGRAM_BOT_TOKEN: z.string().optional().default(''),
  TELEGRAM_BOT_USERNAME: z.string().optional().default(''),
  TELEGRAM_WEBHOOK_SECRET: z.string().optional().default(''),
  TELEGRAM_2FA_ENABLED: z
    .string()
    .optional()
    .default('true')
    .transform((v) => v !== 'false' && v !== '0'),
  TELEGRAM_2FA_BYPASS: z
    .string()
    .optional()
    .default('false')
    .transform((v) => v === 'true' || v === '1'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment configuration');
}

export const env = {
  ...parsed.data,
  corsOrigins: parsed.data.CORS_ORIGIN.split(',').map((item) => item.trim()).filter(Boolean),
};
