import { z } from "zod";

/**
 * `resumeId` is a plain string, not validated against real resume ids, for
 * the same reason as jobApplicationSchema.resumeId — the select is always
 * server-rendered from the current user's own resumes.
 */
export const careerChatThreadSchema = z.object({
  resumeId: z.string(),
});

export type CareerChatThreadInput = z.infer<typeof careerChatThreadSchema>;
