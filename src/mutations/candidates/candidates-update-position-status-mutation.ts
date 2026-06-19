import type { UseMutationOptions } from '@tanstack/react-query';
import {GetIdResponse} from "@/client/validators";
import {CandidatePositionStatusUpdate} from "@/validators/candidates/candidates-position-status-update";
import {candidateUpdatePositionStatusMethod} from "@/services/candidate-methods";

export const candidatesUpdatePositionsStatusMutation: UseMutationOptions<GetIdResponse, Error, { id: string, position_id: string, data: CandidatePositionStatusUpdate }> = {
    mutationFn: ({ id, position_id, data }) => candidateUpdatePositionStatusMethod(id, position_id, data)
};

