import { z } from "zod";

export const clientPositionCountry = z.object({
    name: z.string(),
    id: z.string(),
});

export type ClientPositionCountry = z.infer<typeof clientPositionCountry>;


export const clientPosition = z.object({
    name: z.string().min(1, "Position name is required"),
    positiveSignals: z.array(z.string()).default([]),
    riskIndicators: z.array(z.string()).default([]),
    purpose: z.string().min(1, "Purpose of the role is required"),
    countries: z.array(clientPositionCountry)
})

export const clientPositionParams = z.object({
    id: z.string(),
    position_id: z.string(),
})

export const clientsModel = z.object({
    company: z.string().min(2, "Company name is required"),
    contact: z.string().min(2, "Contact person is required"),
    address: z.string().min(5, "Address is required"),
    phone: z.string().regex(/^\+?[\d\s\-\(\)]{7,20}$/, "Invalid phone format"),
    email: z.email("Invalid email address"),
    // requestedPositions: clientPositionAddSchema.array().default([])
});

export type ClientsModel = z.infer<typeof clientsModel>;
export type ClientPosition = z.infer<typeof clientPosition>;
export type ClientPositionParams = z.infer<typeof clientPositionParams>;