import { z } from "zod";

/**
 * Shared validation rules for note input. Defined once so the same limits
 * apply everywhere a note can be created or edited.
 */
export const noteSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required.")
    .max(100, "Title must be 100 characters or fewer."),
  content: z
    .string()
    .trim()
    .max(10000, "Content must be 10,000 characters or fewer."),
});

export type NoteInput = z.infer<typeof noteSchema>;
