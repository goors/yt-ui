import z from "zod";

export const candidateUpdateForm = z.instanceof(FormData);

export type CandidateUpdateForm = z.infer<typeof candidateUpdateForm>;

export const candidateUpdateSchema = z.object({
    title: z.string().min(1, "Name is required"),
    email: z.email("Invalid email address").optional().or(z.literal("")),
    link: z.url("Invalid URL").optional().or(z.literal("")),
    countryObject: z.object({
        name: z.string(),
        id: z.string(),
    }).optional(),
    notes: z.string().optional(),
    snippet: z.string().optional(),

    cv: z
        .instanceof(File, { message: "CV file is required" })
        .refine((file) => file.size <= 5 * 1024 * 1024, "File size must be under 5MB")
        .refine(
            (file) =>
                [
                    "application/pdf",
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    "application/msword",
                    "text/plain",
                ].includes(file.type),
            "Only PDF, DOCX, DOC, or TXT files are allowed"
        )
        .optional(),
});

export type CandidateUpdateSchema = z.infer<typeof candidateUpdateSchema> ;