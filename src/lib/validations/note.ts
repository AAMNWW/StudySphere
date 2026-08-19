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
  // Content is Tiptap's HTML output, not plain text, so this bound leaves
  // headroom for markup overhead on top of a ~10,000-character note.
  content: z
    .string()
    .trim()
    .max(50000, "Content is too long."),
});

export type NoteInput = z.infer<typeof noteSchema>;
