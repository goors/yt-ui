import {query} from "@/client/core";
import {getClient} from "@/client/api-client";
import {CandidatePositionStatusUpdate} from "@/validators/candidates/candidates-position-status-update";
import {
    candidatesUpdatePositionStatusEndpoint
} from "@/client/endpoints/candidates/candidates-update-position-status-endpoint";
import {CandidatesQuery} from "@/validators/candidates/candidates-query";
import {candidatesQueryEndpoint} from "@/client/endpoints/candidates/candidates-query-endpoint";
import {candidatesQueryFiltersEndpoint} from "@/client/endpoints/candidates/candidates-query-filters-endpoint";
import {candidatesUpdateEndpoint} from "@/client/endpoints/candidates/candidates-update-endpoint";
import {candidatesCreateEndpoint} from "@/client/endpoints/candidates/candidates-create-endpoint";
import {candidatesCvEndpoint} from "@/client/endpoints/candidates/candidates-cv-endpoint";

const client = getClient()
const candidateUpdatePositionStatusMethod = async (id: string, position_id: string, model: CandidatePositionStatusUpdate) => {
    return query(client, candidatesUpdatePositionStatusEndpoint, { param: {id, position_id}, body: model });
}

const candidateUpdateMethod = async (id: string, model: FormData) => {
    return query(client, candidatesUpdateEndpoint, { param: {id}, body: model as any });
}

const candidatesGetCvMethod = async (id: string) => {
    return query(client, candidatesCvEndpoint, { param: {id} }, undefined, true, true);
}

const candidatesCreateMethod = async (model: FormData) => {
    return query(client, candidatesCreateEndpoint, { body: model } as any);
}

const candidatesQueryMethod = async (queryModel: CandidatesQuery, signal?: AbortSignal) => {
    return query(client, candidatesQueryEndpoint, { query: queryModel }, signal);
};

const candidatesQueryFiltersMethod = async (signal?: AbortSignal) => {
    return query(client, candidatesQueryFiltersEndpoint, null, signal);
};


export {
    candidateUpdatePositionStatusMethod,
    candidatesQueryMethod,
    candidatesQueryFiltersMethod,
    candidateUpdateMethod,
    candidatesCreateMethod,
    candidatesGetCvMethod,

};
