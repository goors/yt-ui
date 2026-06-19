import { queryOptions } from '@tanstack/react-query';
import {CandidatesQuery} from "@/validators/candidates/candidates-query.ts";
import {candidatesQueryMethod} from "@/services/candidate-methods.ts";
export const candidatesQueryOptions = (
  enabled: boolean,
  where: string,
  query: CandidatesQuery,
  signal?: AbortSignal
) =>
  queryOptions({
    queryKey: ['candidates', where, query],
    queryFn: () => candidatesQueryMethod(query, signal),
    enabled: enabled,
  });
