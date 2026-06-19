import {CountriesQuery} from "@/validators/misc/countries-query";
import {countriesQueryEndpoint} from "@/client/endpoints";
import {query} from "@/client/core";
import {getClient} from "@/client/api-client";
const client = getClient()
const countriesQueryMethod = async (queryModel: CountriesQuery, signal?: AbortSignal) => {
    return query(client, countriesQueryEndpoint, { query: queryModel }, signal);
};

export { countriesQueryMethod };
