import { z } from 'zod';
import { PRODUCT_CATEGORIES } from '../../models/Product.js';

const optionalDate = z
  .union([z.string().date(), z.literal(''), z.null()])
  .optional();

export const productSchema = z.object({
  name: z.string().trim().min(1).max(120),
  brand: z.string().trim().max(100).optional().default(''),
  model: z.string().trim().max(100).optional().default(''),
  serialNumber: z.string().trim().max(120).optional().default(''),
  category: z.enum(PRODUCT_CATEGORIES).default('Other'),
  purchaseDate: optionalDate,
  purchasePrice: z
    .union([z.literal(''), z.null(), z.coerce.number().min(0)])
    .optional(),
  currentValue: z.union([z.literal(''), z.null(), z.coerce.number().min(0)]).optional(),
  replacementCost: z.union([z.literal(''), z.null(), z.coerce.number().min(0)]).optional(),
  location: z.string().trim().max(160).optional().default(''),
  currency: z.string().trim().length(3).optional().default('USD'),
  seller: z.string().trim().max(120).optional().default(''),
  notes: z.string().trim().max(3000).optional().default(''),
});

export const productUpdateSchema = productSchema.partial();
