import { queryOptions } from '@tanstack/react-query';
import {clientsPositionsJobsQueryMethod} from "@/services/client-methods";
export const clientsPositionsJobsQueryOptions = (
  enabled: boolean,
  client_id: string,
  position_id: string,
) =>
  queryOptions({
    queryKey: ['clients', 'positions', "jobs" ,client_id, position_id],
    queryFn: () => clientsPositionsJobsQueryMethod(client_id, position_id),
    enabled: enabled,
  });
