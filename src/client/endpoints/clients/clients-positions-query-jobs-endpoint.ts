import type { FetchioEndpoint } from '../types';
import {
    clientPositionParams,
    ClientPositionParams
} from "@/validators/clients/client-add";
import {
    ClientPositionJobsQueryResponse,
    clientPositionJobsQueryResponse
} from "@/validators/clients/clients-position-job-query-response.ts";

const clientsPositionsQueryJobsEndpoint: FetchioEndpoint<ClientPositionJobsQueryResponse, null, ClientPositionParams> = {
    method: 'GET',
    url: '/v1/clients/{id}/positions/{position_id}/jobs',
    responseSchema: clientPositionJobsQueryResponse,
    requestParamSchema: clientPositionParams
};

export { clientsPositionsQueryJobsEndpoint };
