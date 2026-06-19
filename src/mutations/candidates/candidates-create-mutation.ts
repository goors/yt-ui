import type { UseMutationOptions } from '@tanstack/react-query';
import { GetIdResponse } from "@/client/validators";
import { candidatesCreateMethod } from "@/services/candidate-methods";

export const candidatesCreateMutation: UseMutationOptions<GetIdResponse, Error, { data: FormData }> = {
    mutationFn: ({ data }) => candidatesCreateMethod(data)
};
