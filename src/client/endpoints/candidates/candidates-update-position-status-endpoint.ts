import type { FetchioEndpoint } from '../types';
import {GetIdResponse, responseId} from "@/client/validators";
import {
    CandidatePositionStatusUpdate,
    candidatePositionStatusUpdate, candidatePositionStatusUpdateParams,
    CandidatePositionStatusUpdateParams
} from "@/validators/candidates/candidates-position-status-update";

const candidatesUpdatePositionStatusEndpoint: FetchioEndpoint<GetIdResponse, CandidatePositionStatusUpdate, CandidatePositionStatusUpdateParams> = {
    method: 'PUT',
    url: '/v1/candidates/{id}/positions/{position_id}',
    responseSchema: responseId,
    requestBodySchema: candidatePositionStatusUpdate,
    requestParamSchema: candidatePositionStatusUpdateParams
};

export { candidatesUpdatePositionStatusEndpoint };
