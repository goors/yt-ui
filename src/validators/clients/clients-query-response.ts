import z from "zod";

export const clientQueryResponse = z.object({
    id: z.string(),
    company: z.string(),
    contact: z.string(),
    address: z.string(),
    phone: z.string(),
    email: z.email(),
    updated_at: z.coerce.date(),
})

export type ClientQueryResponse = z.infer<typeof clientQueryResponse>;

export const clientsQueryResponse = z.array(clientQueryResponse)

export type ClientsQueryResponse = z.infer<typeof clientsQueryResponse>;