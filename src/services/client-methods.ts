import {clientsQueryEndpoint} from "@/client/endpoints/clients/clients-query-endpoint";
import {ClientsQuery} from "@/validators/clients/clients-query";
import {query} from "@/client/core";
import {client} from "@/client/api-client";
import {ClientPosition, ClientsModel} from "@/validators/clients/client-add";
import {clientsCreateEndpoint} from "@/client/endpoints/clients/clients-create-endpoint";
import {clientsUpdateEndpoint} from "@/client/endpoints/clients/clients-update-endpoint";
import {clientsCreatePositionEndpoint} from "@/client/endpoints/clients/clients-create-position-endpoint";
import {clientsPositionsQueryEndpoint} from "@/client/endpoints/clients/clients-positions-query-endpoint";
import {clientsUpdatePositionEndpoint} from "@/client/endpoints/clients/clients-update-position-endpoint";


const clientsQueryMethod = async (queryModel: ClientsQuery, signal?: AbortSignal) => {
  return query(client, clientsQueryEndpoint, { query: queryModel }, signal);
};

const clientsPositionsQueryMethod = async (queryModel: ClientsQuery, client_id: string, signal?: AbortSignal) => {
    return query(client, clientsPositionsQueryEndpoint, { query: queryModel, param: {id: client_id} }, signal);
};

const clientsCreateMethod = async (model: ClientsModel) => {
    return query(client, clientsCreateEndpoint, { body: model });
}


const clientsUpdateMethod = async (id: string, model: ClientsModel) => {
    return query(client, clientsUpdateEndpoint, { param: {id}, body: model });
}

const clientsUpdatePositionMethod = async (id: string, position_id: string, model: ClientPosition) => {
    return query(client, clientsUpdatePositionEndpoint, { param: {id, position_id}, body: model });
}

const clientsCreatePositionMethod = async (id: string, model: ClientPosition) => {
    return query(client, clientsCreatePositionEndpoint, { param: {id}, body: model });
}


export {
    clientsQueryMethod,
    clientsCreateMethod,
    clientsUpdateMethod,
    clientsCreatePositionMethod,
    clientsPositionsQueryMethod,
    clientsUpdatePositionMethod

};
