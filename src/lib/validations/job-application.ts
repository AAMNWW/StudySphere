import { z } from "zod";

import { JobApplicationStatus } from "@/generated/prisma/enums";

/**
 * Shared validation rules for a job application. `resumeId` is a plain
 * string here (not validated against real resume ids) because the select
 * options are always server-rendered from the current user's own resumes
 * — an invalid id just fails the ownership-scoped update silently, same
 * trust level as any other <select> the user can't actually tamper with
 * to point at someone else's row.
 */
export const jobApplicationSchema = z.object({
  company: z
    .string()
    .trim()
    .min(1, "Company is required.")
    .max(100, "Company must be 100 characters or fewer."),
  role: z
    .string()
    .trim()
    .min(1, "Role is required.")
    .max(100, "Role must be 100 characters or fewer."),
  status: z.enum(JobApplicationStatus),
  // Comes from an <input type="url">, so "" (not applicable yet) or a URL.
  jobUrl: z
    .string()
    .trim()
    .refine((value) => value === "" || z.url().safeParse(value).success, "Enter a valid URL."),
  jobDescription: z
    .string()
    .trim()
    .max(10000, "Job description must be 10,000 characters or fewer."),
  notes: z.string().trim().max(2000, "Notes must be 2,000 characters or fewer."),
  resumeId: z.string(),
});

export type JobApplicationInput = z.infer<typeof jobApplicationSchema>;
