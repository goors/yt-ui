import z from "zod";

export const clientPositionJobsQueryResponse = z.any()

export type ClientPositionJobsQueryResponse = z.infer<typeof clientPositionJobsQueryResponse>;

