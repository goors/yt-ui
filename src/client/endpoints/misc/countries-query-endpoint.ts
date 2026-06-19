import { FetchioEndpoint } from '../types';
import {countriesQuery, CountriesQuery} from "@/validators/misc/countries-query";
import {
    countriesQueryResponse,
    CountriesQueryResponse,
} from "@/validators/misc/countries-query-response";

const countriesQueryEndpoint: FetchioEndpoint<
    CountriesQueryResponse,
    void,
    CountriesQuery
> = {
    method: 'GET',
    url: '/v1/misc/countries/query',
    responseSchema: countriesQueryResponse,
    requestQuerySchema: countriesQuery,
};

export { countriesQueryEndpoint };
