import type { FetchioEndpoint } from '../types';
import {GetIdParam, GetIdResponse, requestParamSchema, responseId} from "@/client/validators";
import {clientsModel, ClientsModel} from "@/validators/clients/client-add";

const clientsUpdateEndpoint: FetchioEndpoint<GetIdResponse, ClientsModel, GetIdParam> = {
  method: 'PUT',
  url: '/v1/clients/{id}',
  responseSchema: responseId,
  requestBodySchema: clientsModel,
  requestParamSchema: requestParamSchema
};

export { clientsUpdateEndpoint };
