import type { UseMutationOptions } from '@tanstack/react-query';
import {ClientPosition} from "@/validators/clients/client-add";
import {GetIdResponse} from "@/client/validators";
import {clientsUpdatePositionMethod} from "@/services/client-methods.ts";

export const clientsUpdatePositionsMutation: UseMutationOptions<GetIdResponse, Error, { id: string, position_id: string, data: ClientPosition }> = {
    mutationFn: ({ id, position_id, data }) => clientsUpdatePositionMethod(id, position_id, data)
};

