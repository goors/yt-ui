import type { FetchioEndpoint } from '../types';
import {GetIdParam, GetIdResponse, requestParamSchema, responseId} from "@/client/validators";
import {
    candidateUpdateForm,
    CandidateUpdateForm,
} from "@/validators/candidates/candidate-update";

const candidatesUpdateEndpoint: FetchioEndpoint<GetIdResponse, CandidateUpdateForm, GetIdParam> = {
    method: 'PUT',
    url: '/v1/candidates/{id}',
    responseSchema: responseId,
    requestBodySchema: candidateUpdateForm,
    requestParamSchema: requestParamSchema
};

export { candidatesUpdateEndpoint };
