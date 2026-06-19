import type { FetchioEndpoint } from '../types';
import {GetIdResponse, responseId} from "@/client/validators";
import {clientsModel, ClientsModel} from "@/validators/clients/client-add";

const clientsCreateEndpoint: FetchioEndpoint<GetIdResponse, ClientsModel, void> = {
  method: 'POST',
  url: '/v1/clients',
  responseSchema: responseId,
  requestBodySchema: clientsModel,
};

export { clientsCreateEndpoint };
