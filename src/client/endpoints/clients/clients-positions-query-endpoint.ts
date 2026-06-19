import type { FetchioEndpoint } from '../types';
import {clientsQuery, ClientsQuery} from "@/validators/clients/clients-query";
import {requestParamSchema} from "@/client/validators";
import {
    clientsPositionsQueryResponse,
    ClientsPositionsQueryResponse
} from "@/validators/clients/clients-position-query-response";

const clientsPositionsQueryEndpoint: FetchioEndpoint<ClientsPositionsQueryResponse, void, ClientsQuery> = {
  method: 'GET',
  url: '/v1/clients/{id}/positions/query',
  responseSchema: clientsPositionsQueryResponse,
  requestQuerySchema: clientsQuery,
  requestParamSchema: requestParamSchema,
};

export { clientsPositionsQueryEndpoint };
