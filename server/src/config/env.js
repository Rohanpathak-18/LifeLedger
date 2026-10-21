import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

dotenv.config({ path: fileURLToPath(new URL('../../.env', import.meta.url)) });

const schema = z
  .object({
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),
    PORT: z.coerce.number().int().min(1).max(65535).default(5000),
    MONGODB_URI: z.string().default(''),
    CLIENT_URL: z.string().url().default('http://localhost:5173'),
    JWT_ACCESS_SECRET: z
      .string()
      .min(32)
      .default('development-only-change-this-secret-32'),
    ACCESS_TOKEN_TTL: z.string().default('15m'),
    REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().min(1).max(90).default(7),
    COOKIE_SECURE: z
      .enum(['true', 'false'])
      .default('false')
      .transform((value) => value === 'true'),
    COOKIE_SAME_SITE: z.enum(['strict', 'lax', 'none']).default('lax'),
    RESEND_API_KEY: z.string().default(''),
    EMAIL_FROM: z.string().default(''),
    CONTACT_EMAIL: z.string().default(''),
    APP_URL: z.string().url().default('http://localhost:5173'),
    WARRANTY_REMINDER_INTERVAL_HOURS: z.coerce
      .number()
      .int()
      .min(1)
      .max(168)
      .default(24),
  })
  .superRefine((value, context) => {
    if (
      value.NODE_ENV === 'production' &&
      value.JWT_ACCESS_SECRET === 'development-only-change-this-secret-32'
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['JWT_ACCESS_SECRET'],
        message: 'Set a unique JWT access secret in production',
      });
    }

    if (value.NODE_ENV === 'production' && !value.MONGODB_URI.trim()) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['MONGODB_URI'],
        message: 'Set the production MongoDB connection string',
      });
    }

    if (
      value.NODE_ENV === 'production' &&
      value.CLIENT_URL.startsWith('http://localhost')
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['CLIENT_URL'],
        message: 'Set CLIENT_URL to the deployed frontend origin',
      });
    }

    if (value.COOKIE_SAME_SITE === 'none' && !value.COOKIE_SECURE) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['COOKIE_SECURE'],
        message: 'COOKIE_SECURE must be true when COOKIE_SAME_SITE is none',
      });
    }
  });

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error(
    'Invalid environment configuration',
    parsed.error.flatten().fieldErrors,
  );
  process.exit(1);
}

export const env = parsed.data;
