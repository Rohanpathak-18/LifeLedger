import { z } from 'zod';

export const documentMetadataSchema = z.object({
  productId: z.union([z.string().min(1), z.literal('')]).optional(),
  type: z
    .enum(['receipt', 'warranty', 'manual', 'repair_invoice', 'other'])
    .default('other'),
  extractedText: z.string().max(20000).optional().default(''),
  extractedData: z.object({
    productName: z.string().max(120).optional().default(''),
    purchaseDate: z.union([z.string().date(), z.literal(''), z.null()]).optional(),
    purchasePrice: z.union([z.literal(''), z.null(), z.coerce.number().min(0)]).optional(),
    currency: z.string().max(3).optional().default(''),
    warrantyPeriod: z.string().max(60).optional().default(''),
  }).optional().default({}),
});
