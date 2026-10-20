import { z } from 'zod';

const date = z.string().date();
const currency = z.string().trim().length(3).optional().default('USD');

export const repairSchema = z.object({
  productId: z.string().min(1),
  serviceDate: date,
  provider: z.string().trim().max(120).optional().default(''),
  description: z.string().trim().min(1).max(1000),
  cost: z.union([z.literal(''), z.null(), z.coerce.number().min(0)]).optional(),
  currency,
});

export const maintenanceSchema = z.object({
  productId: z.string().min(1),
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().max(1000).optional().default(''),
  dueDate: date,
  recurrence: z
    .enum(['none', 'monthly', 'quarterly', 'yearly'])
    .default('none'),
});

export const maintenanceUpdateSchema = maintenanceSchema
  .omit({ productId: true })
  .partial()
  .extend({
    status: z.enum(['open', 'completed']).optional(),
  });
