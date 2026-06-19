import { queryOptions } from '@tanstack/react-query';
import {ClientsQuery} from "@/validators/clients/clients-query";
import {clientsPositionsQueryMethod} from "@/services/client-methods";
export const clientsPositionsQueryOptions = (
  enabled: boolean,
  query: ClientsQuery,
  client_id: string,
  signal?: AbortSignal
) =>
  queryOptions({
    queryKey: ['clients', 'positions' ,client_id, query],
    queryFn: () => clientsPositionsQueryMethod(query, client_id, signal),
    enabled: enabled,
  });
