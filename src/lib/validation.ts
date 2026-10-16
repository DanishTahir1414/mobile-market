import { z } from 'zod';
export const draftSchema = z.object({
  brand: z.string().min(1, 'Choose a brand.'),
  model: z.string().min(1, 'Choose a model.'),
  storage: z.string().min(1, 'Choose storage.'),
  price: z
    .string()
    .refine(
      (v) => Number(v) > 0 && Number(v) <= 10000000,
      'Enter a price between PKR 1 and 10,000,000.',
    ),
  city: z.string().min(1, 'Choose a city.'),
  color: z.string().min(1, 'Enter the device color.'),
  condition: z.string().min(1, 'Choose a condition.'),
  pta: z.string().min(1, 'Choose a PTA status.'),
  description: z.string().min(20, 'Write at least 20 characters.').max(5000),
  battery: z
    .string()
    .refine(
      (v) => v === '' || (Number(v) >= 0 && Number(v) <= 100),
      'Use a percentage from 0 to 100.',
    ),
  consent: z.boolean().refine(Boolean, 'Confirm contact-sharing consent.'),
});
