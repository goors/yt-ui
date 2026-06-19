import type { FetchioEndpoint } from '../types';
import {GetIdResponse, responseId} from "@/client/validators";
import {
    clientPosition,
    ClientPosition,
    clientPositionParams,
    ClientPositionParams
} from "@/validators/clients/client-add";

const clientsUpdatePositionEndpoint: FetchioEndpoint<GetIdResponse, ClientPosition, ClientPositionParams> = {
    method: 'PUT',
    url: '/v1/clients/{id}/positions/{position_id}',
    responseSchema: responseId,
    requestBodySchema: clientPosition,
    requestParamSchema: clientPositionParams
};

export { clientsUpdatePositionEndpoint };
