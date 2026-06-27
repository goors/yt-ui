import { z } from 'zod';

// CandidateResponse Schema
export const candidateResponse = z.object({
    id: z.string(),
    name: z.string(),
    country: z.string().nullable().optional(),
    countryObject: z.object({
        id: z.string(),
        name: z.string()
    }).nullable(),

    score: z.number().nullable().optional(),
    source: z.string().nullable().optional(),
    link: z.string().url().nullable().optional(),
    crawled: z.boolean().nullable().optional(),
    email: z.string().nullable().optional(),
    data: z.any().nullable().optional(),
    text_found: z.string().nullable().optional(),
    snippet: z.string().nullable().optional(),
    cv: z.any().nullable().optional(),
});

// CandidatesQueryResponse Schema
export const candidatesQueryResponse = z.object({
    total_pages: z.number().int(),
    current_page: z.number().int(),
    candidates: z.array(candidateResponse),
});

// TypeScript Inference (Optional: Use this to get types from the schema)
export type CandidateResponse = z.infer<typeof candidateResponse>;
export type CandidatesQueryResponse = z.infer<typeof candidatesQueryResponse>;