import { z } from 'zod';

export const countryResponseSchema = z.object({
  name: z.string(),
  id: z.string(),
  code: z.string().optional(),
});

export type CountryResponseSchema = z.infer<typeof countryResponseSchema>;

export const countriesQueryResponse = z.array(countryResponseSchema)

export type CountriesQueryResponse = z.infer<typeof countriesQueryResponse>;
