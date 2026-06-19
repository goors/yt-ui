import type { UseMutationOptions } from '@tanstack/react-query';
import {ClientPosition} from "@/validators/clients/client-add";
import {GetIdResponse} from "@/client/validators";
import {clientsCreatePositionMethod} from "@/services/client-methods";

export const clientsCreatePositionMutation: UseMutationOptions<GetIdResponse, Error, { id: string, data: ClientPosition }> = {
    mutationFn: ({ id, data }) => clientsCreatePositionMethod(id, data)
};

