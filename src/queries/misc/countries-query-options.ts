import { queryOptions } from '@tanstack/react-query';
import {CountriesQuery} from "@/validators/misc/countries-query";
import {countriesQueryMethod} from "@/services/misc-methods";
export const countriesQueryOptions = (
  enabled: boolean,
  query: CountriesQuery,
  signal?: AbortSignal
) =>
  queryOptions({
    queryKey: ['misc', 'countries', query],
    queryFn: () => countriesQueryMethod(query, signal),
    enabled: enabled,
  });
