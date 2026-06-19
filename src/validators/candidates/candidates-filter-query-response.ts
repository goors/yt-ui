import z from "zod";

export const candidateFiltersQueryResponse = z.object({
    countries: z.string().array(),
    sources: z.string().array()
})

export type CandidateFiltersQueryResponse = z.infer<typeof candidateFiltersQueryResponse>;