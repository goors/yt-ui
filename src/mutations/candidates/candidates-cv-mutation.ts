import type { UseMutationOptions } from '@tanstack/react-query';
import {candidatesGetCvMethod} from "@/services/candidate-methods";
import {CandidateCvResponse} from "@/validators/candidates/candidates-cv-response.ts";

export const candidatesCvMutation: UseMutationOptions<CandidateCvResponse, Error, { id: string }> = {
    mutationFn: ({ id }) => candidatesGetCvMethod(id)
};

