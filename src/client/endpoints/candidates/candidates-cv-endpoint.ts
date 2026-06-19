import type { FetchioEndpoint } from '../types';
import {GetIdParam, requestParamSchema} from "@/client/validators";
import {CandidateCvResponse, candidatesCvResponse} from "@/validators/candidates/candidates-cv-response";

const candidatesCvEndpoint: FetchioEndpoint<CandidateCvResponse, void, GetIdParam> = {
    method: 'GET',
    url: '/v1/candidates/{id}/cv',
    responseSchema: candidatesCvResponse,
    requestParamSchema: requestParamSchema
};

export { candidatesCvEndpoint };
