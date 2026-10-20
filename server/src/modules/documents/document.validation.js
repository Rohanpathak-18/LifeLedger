import { z } from 'zod';

export const documentMetadataSchema = z.object({
  productId: z.union([z.string().min(1), z.literal('')]).optional(),
  type: z
    .enum(['receipt', 'warranty', 'manual', 'repair_invoice', 'other'])
    .default('other'),
});
