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

/** For the standalone "credit hours" control in course settings — separate
 * from createCourseSchema since credit hours are set once a student starts
 * caring about grades, not required just to create a course. */
export const creditHoursSchema = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || (!Number.isNaN(Number(value)) && Number(value) >= 0),
    "Enter a valid number of credit hours.",
  );
