import type { FetchioEndpoint } from '../types';
import {
    candidateFiltersQueryResponse,
    CandidateFiltersQueryResponse
} from "@/validators/candidates/candidates-filter-query-response.ts";

const candidatesQueryFiltersEndpoint: FetchioEndpoint<CandidateFiltersQueryResponse, void, void> = {
  method: 'GET',
  url: '/v1/candidates/filters',
  responseSchema: candidateFiltersQueryResponse,
};

export { candidatesQueryFiltersEndpoint };
