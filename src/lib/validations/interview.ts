import { z } from "zod";

/**
 * `resumeId` is a plain string, not validated against real resume ids, for
 * the same reason as jobApplicationSchema.resumeId — the select is always
 * server-rendered from the current user's own resumes.
 */
export const interviewSessionSchema = z.object({
  role: z
    .string()
    .trim()
    .min(1, "Role is required.")
    .max(100, "Role must be 100 characters or fewer."),
  company: z.string().trim().max(100, "Company must be 100 characters or fewer."),
  resumeId: z.string(),
});

export type InterviewSessionInput = z.infer<typeof interviewSessionSchema>;
