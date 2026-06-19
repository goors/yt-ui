import type { UseMutationOptions } from '@tanstack/react-query';
import {ClientsModel} from "@/validators/clients/client-add";
import {GetIdResponse} from "@/client/validators";
import {clientsUpdateMethod} from "@/services/client-methods";

export const clientsUpdateMutation: UseMutationOptions<GetIdResponse, Error, { id: string, data: ClientsModel }> = {
    mutationFn: ({ id, data }) => clientsUpdateMethod(id, data)
};

