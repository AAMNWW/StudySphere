import { z } from "zod";

/** Shared validation rules for exam input, mirroring assignmentSchema. */
export const examSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required.")
    .max(100, "Title must be 100 characters or fewer."),
  // Comes from an <input type="date">, so "YYYY-MM-DD" — unlike an
  // assignment's due date, an exam date isn't optional.
  examDate: z
    .string()
    .trim()
    .refine((value) => !Number.isNaN(Date.parse(value)), "Enter a valid date."),
  notes: z
    .string()
    .trim()
    .max(2000, "Notes must be 2,000 characters or fewer."),
});

export type ExamInput = z.infer<typeof examSchema>;
