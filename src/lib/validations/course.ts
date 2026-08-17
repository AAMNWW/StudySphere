import { z } from "zod";

/**
 * Shared validation rules for course input. Defined once so the same limits
 * apply everywhere a course can be created or edited.
 */
export const createCourseSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required.")
    .max(100, "Title must be 100 characters or fewer."),
  description: z
    .string()
    .trim()
    .max(500, "Description must be 500 characters or fewer."),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
