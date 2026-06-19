import { z } from "zod";

// Use an empty object because there is no JSON body to validate
export const candidatesCvResponse = z.any();

export type CandidateCvResponse = z.infer<typeof candidatesCvResponse>;