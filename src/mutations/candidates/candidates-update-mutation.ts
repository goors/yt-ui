import type { UseMutationOptions } from '@tanstack/react-query';
import {GetIdResponse} from "@/client/validators";
import {candidateUpdateMethod} from "@/services/candidate-methods";
import {CandidateUpdateSchema} from "@/validators/candidates/candidate-update";

export const candidatesUpdatePositionsStatusMutation: UseMutationOptions<GetIdResponse, Error, { id: string, data: FormData }> = {
    mutationFn: ({ id, data }) => candidateUpdateMethod(id, data)
};

