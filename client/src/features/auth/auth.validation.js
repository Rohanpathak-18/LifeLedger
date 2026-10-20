import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
  password: z.string().min(1, 'Enter your password'),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Enter at least 2 characters').max(80),
  email: z.string().trim().email('Enter a valid email address'),
  password: z.string().min(10, 'Use at least 10 characters').max(128),
});
