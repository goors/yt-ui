import z from "zod";

export const candidatePositionStatusUpdate = z.object({
    status: z.string(),
    video_url: z.string().optional(),
    paradigm_baseline: z.string().optional(),
    notes: z.string().optional(),
});

export type CandidatePositionStatusUpdate = z.infer<typeof candidatePositionStatusUpdate> ;

export const candidatePositionStatusUpdateParams = z.object({
    id: z.string(),
    position_id: z.string().optional(),
});

export type CandidatePositionStatusUpdateParams = z.infer<typeof candidatePositionStatusUpdateParams> ;