import type { FetchioEndpoint } from '../types';
import {clientsQuery, ClientsQuery} from "@/validators/clients/clients-query";
import {clientsQueryResponse, ClientsQueryResponse} from "@/validators/clients/clients-query-response";

const clientsQueryEndpoint: FetchioEndpoint<ClientsQueryResponse, void, ClientsQuery> = {
  method: 'GET',
  url: '/v1/clients/query',
  responseSchema: clientsQueryResponse,
  requestQuerySchema: clientsQuery,
};

export { clientsQueryEndpoint };
