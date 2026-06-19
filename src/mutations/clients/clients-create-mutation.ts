import type { UseMutationOptions } from '@tanstack/react-query';
import {ClientsModel} from "@/validators/clients/client-add";
import {GetIdResponse} from "@/client/validators";
import {clientsCreateMethod} from "@/services/client-methods";

export const clientsCreateMutation: UseMutationOptions<GetIdResponse, Error, ClientsModel> = {
    mutationFn: (model: ClientsModel) => clientsCreateMethod(model),
};
