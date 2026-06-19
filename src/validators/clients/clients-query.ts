import z from "zod";

export const clientsQuery = z.object({
    page: z.int(),
    pageSize: z.int(),
    topK: z.int().optional(),
})

export type ClientsQuery = z.infer<typeof clientsQuery>;