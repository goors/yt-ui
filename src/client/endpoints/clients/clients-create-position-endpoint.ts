import type { FetchioEndpoint } from '../types';
import {GetIdParam, GetIdResponse, requestParamSchema, responseId} from "@/client/validators";
import {clientPosition, ClientPosition} from "@/validators/clients/client-add";

const clientsCreatePositionEndpoint: FetchioEndpoint<GetIdResponse, ClientPosition, GetIdParam> = {
    method: 'POST',
    url: '/v1/clients/{id}/positions',
    responseSchema: responseId,
    requestBodySchema: clientPosition,
    requestParamSchema: requestParamSchema
};

export { clientsCreatePositionEndpoint };
