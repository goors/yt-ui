import { queryOptions } from '@tanstack/react-query';
import {candidatesQueryFiltersMethod} from "@/services/candidate-methods";
export const candidatesQueryFiltersOptions = (
  enabled: boolean,
  signal?: AbortSignal
) =>
  queryOptions({
    queryKey: ['candidates', "filters"],
    queryFn: () => candidatesQueryFiltersMethod(signal),
    enabled: enabled,
  });
