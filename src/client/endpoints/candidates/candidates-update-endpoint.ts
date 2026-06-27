import type { FetchioEndpoint } from '../types';
import {GetIdParam, GetIdResponse, requestParamSchema, responseId} from "@/client/validators";
import {candidateAdd, CandidateAdd} from "@/validators/candidates/candidate-add.ts";

const candidatesUpdateEndpoint: FetchioEndpoint<GetIdResponse, CandidateAdd, GetIdParam> = {
    method: 'PUT',
    url: '/v1/candidates/{id}',
    responseSchema: responseId,
    requestBodySchema: candidateAdd,
    requestParamSchema: requestParamSchema
};

export { candidatesUpdateEndpoint };
