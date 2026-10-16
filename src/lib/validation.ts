import { z } from 'zod';
import { catalog, cities } from './catalog';
export const draftSchema = z
  .object({
    brand: z.string().min(1, 'Choose a brand.'),
    model: z.string().min(1, 'Choose a model.'),
    storage: z.string().min(1, 'Choose storage.'),
    price: z
      .string()
      .refine(
        (v) => /^\d+$/.test(v) && Number(v) > 0 && Number(v) <= 10000000,
        'Enter a price between PKR 1 and 10,000,000.',
      ),
    city: z.string().min(1, 'Choose a city.'),
    color: z.string().min(1, 'Enter the device color.'),
    condition: z.enum(['Excellent', 'Good', 'Fair'], { error: 'Choose a condition.' }),
    pta: z.enum(['Approved', 'Not approved', 'Unknown']),
    description: z.string().min(20, 'Write at least 20 characters.').max(5000),
    battery: z
      .string()
      .refine(
        (v) => v === '' || (/^\d+$/.test(v) && Number(v) >= 0 && Number(v) <= 100),
        'Use a percentage from 0 to 100.',
      ),
    consent: z.boolean().refine(Boolean, 'Confirm contact-sharing consent.'),
  })
  .superRefine((value, context) => {
    const model = catalog[value.brand]?.find((model) => model.name === value.model);
    if (!model)
      context.addIssue({
        code: 'custom',
        path: ['model'],
        message: 'Choose a model from this brand.',
      });
    if (!model?.storage.includes(Number(value.storage)))
      context.addIssue({
        code: 'custom',
        path: ['storage'],
        message: 'Choose storage available for this model.',
      });
    if (!cities.includes(value.city))
      context.addIssue({ code: 'custom', path: ['city'], message: 'Choose a listed city.' });
  });
