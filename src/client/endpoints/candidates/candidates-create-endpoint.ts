import type { FetchioEndpoint } from '../types';
import {GetIdResponse, requestParamSchema, responseId} from "@/client/validators";
import {candidateAdd, CandidateAdd} from "@/validators/candidates/candidate-add.ts";

const candidatesCreateEndpoint: FetchioEndpoint<GetIdResponse, CandidateAdd> = {
    method: 'POST',
    url: '/v1/candidates',
    responseSchema: responseId,
    requestBodySchema: candidateAdd,
};

export { candidatesCreateEndpoint };
