import { createFetchio, type FetchioClient } from './core';

let client: FetchioClient;

function initializeClient() {
  const companyId: string | undefined = undefined;
  client = createFetchio({
    apiUrl: import.meta.env.VITE_API_URL,
    debug: import.meta.env.VITE_CLIENT_DEBUG,
    lang: 'en-US',
    companyId,
    handle: {
      unauthenticated: () => {},
      internalError: (_payload) => {
        return _payload.message;
      },
    },
  });
}

initializeClient();

const reInitializeClient = initializeClient;

export { client, reInitializeClient };
