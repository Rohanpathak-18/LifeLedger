import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().trim().min(1, 'Give this item a name').max(120),
  brand: z.string().trim().max(100),
  model: z.string().trim().max(100),
  serialNumber: z.string().trim().max(120),
  category: z.enum([
    'Electronics',
    'Home appliances',
    'Furniture',
    'Vehicles and accessories',
    'Tools and equipment',
    'Other',
  ]),
  purchaseDate: z.string(),
  purchasePrice: z.union([
    z.literal(''),
    z.coerce.number().min(0, 'Price must be zero or more'),
  ]),
  currency: z.string().length(3, 'Use a 3-letter currency code'),
  seller: z.string().trim().max(120),
  notes: z.string().trim().max(3000),
});
