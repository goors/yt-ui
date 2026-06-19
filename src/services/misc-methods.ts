import {CountriesQuery} from "@/validators/misc/countries-query";
import {countriesQueryEndpoint} from "@/client/endpoints";
import {query} from "@/client/core";
import {client} from "@/client/api-client";

const countriesQueryMethod = async (queryModel: CountriesQuery, signal?: AbortSignal) => {
    return query(client, countriesQueryEndpoint, { query: queryModel }, signal);
};

export { countriesQueryMethod };
