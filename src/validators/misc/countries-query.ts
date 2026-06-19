import { z } from 'zod';

export const countriesQuery = z.object({
  page: z.number().optional(),
  pageSize: z.number().optional(),
  maxItemCount: z.number(),
  name: z.string().optional(),
});

export type CountriesQuery = z.infer<typeof countriesQuery>;
