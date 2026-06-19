import { queryOptions } from '@tanstack/react-query';
import {ClientsQuery} from "@/validators/clients/clients-query";
import {clientsQueryMethod} from "@/services/client-methods";
export const clientsQueryOptions = (
  enabled: boolean,
  query: ClientsQuery,
  signal?: AbortSignal
) =>
  queryOptions({
    queryKey: ['clients', query],
    queryFn: () => clientsQueryMethod(query, signal),
    enabled: enabled,
  });
