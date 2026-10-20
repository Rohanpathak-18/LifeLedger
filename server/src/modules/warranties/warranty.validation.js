import { z } from 'zod';

const optionalDate = z
  .union([z.string().date(), z.literal(''), z.null()])
  .optional();

const warrantyFields = z.object({
  productId: z.string().min(1),
  provider: z.string().trim().max(120).optional().default(''),
  startDate: optionalDate,
  endDate: optionalDate,
  reference: z.string().trim().max(160).optional().default(''),
  notes: z.string().trim().max(2000).optional().default(''),
});

export const warrantySchema = warrantyFields.refine(
  (value) =>
    !value.startDate || !value.endDate || value.startDate <= value.endDate,
  {
    path: ['endDate'],
    message: 'End date must be on or after start date',
  },
);

export const warrantyUpdateSchema = warrantyFields
  .omit({ productId: true })
  .partial()
  .refine(
    (value) =>
      !value.startDate || !value.endDate || value.startDate <= value.endDate,
    {
      path: ['endDate'],
      message: 'End date must be on or after start date',
    },
  );
