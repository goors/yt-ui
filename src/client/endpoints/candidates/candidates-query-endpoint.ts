import type { FetchioEndpoint } from '../types';
import {candidatesQueryResponse, CandidatesQueryResponse} from "@/validators/candidates/candidates-query-response";
import {candidatesQuery, CandidatesQuery} from "@/validators/candidates/candidates-query";

const candidatesQueryEndpoint: FetchioEndpoint<CandidatesQueryResponse, void, CandidatesQuery> = {
  method: 'GET',
  url: '/v1/candidates/query',
  responseSchema: candidatesQueryResponse,
  requestQuerySchema: candidatesQuery,
};

export { candidatesQueryEndpoint };
