import z from "zod";

export const candidatesQuery = z.object({
    page: z.int().optional(),
    pageSize: z.int().optional(),
    maxItemCount: z.int().optional(),
    text: z.string().optional(),
    country: z.string().optional(),
    source: z.string().optional(),
})

export type CandidatesQuery = z.infer<typeof candidatesQuery>;