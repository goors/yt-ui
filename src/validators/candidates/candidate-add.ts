import z from "zod";

// The endpoint validation schema expects FormData for multipart file upload
export const candidateAdd = z.instanceof(FormData);

export type CandidateAdd = FormData;