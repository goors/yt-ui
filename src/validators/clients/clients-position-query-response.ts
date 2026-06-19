import z from "zod";
import {clientPositionCountry} from "@/validators/clients/client-add";

export const clientPositionQueryResponse = z.object({
    id: z.string(),
    name: z.string(),
    positiveSignals: z.array(z.string()).default([]),
    riskIndicators: z.array(z.string()).default([]),
    purpose: z.string(),

    countries: z.array(clientPositionCountry),
    potentialCandidates: z.array(z.object({
        candidateId: z.string().optional(),
        name: z.string(),
        email: z.string().nullable(),
        source: z.string().nullable(),
        link: z.string().nullable(),
        data: z.any().nullable(),
        score: z.float64(),
        crawled: z.boolean().nullable().optional(),
        status: z.string().nullable(),
        cv: z.boolean().nullable()
    })).optional(),

    selectedCandidates: z.array(z.object({
        candidateId: z.string().optional(),
        name: z.string(),
        email: z.string().nullable(),
        source: z.string().nullable(),
        link: z.string().nullable(),
        data: z.any().nullable(),
        score: z.float64(),
        crawled: z.boolean().nullable().optional(),
        status: z.string().nullable(),
        snippet: z.string().nullable(),
        transcript_crawled_status: z.string().nullable(),
        transcriptCues: z.any().nullable(),
        candidate_profiling: z.string().nullable(),
        video_url: z.string().nullable(),
        rank: z.float64().nullable(),
        analyses: z.any().nullable(),
        final_profile: z.any().nullable(),
        gemini: z.any().nullable(),
        notes: z.string().nullable(),
        cv: z.boolean().nullable()
    })).optional()
})

export type ClientPositionQueryResponse = z.infer<typeof clientPositionQueryResponse>;

export const clientsPositionsQueryResponse = z.array(clientPositionQueryResponse)

export type ClientsPositionsQueryResponse = z.infer<typeof clientsPositionsQueryResponse>;