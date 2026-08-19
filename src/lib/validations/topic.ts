import { z } from "zod";

export const topicSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required.")
    .max(150, "Title must be 150 characters or fewer."),
  description: z
    .string()
    .trim()
    .max(1000, "Description must be 1,000 characters or fewer."),
  // Comes from a number input, so either "" (unscheduled) or a digit string.
  weekNumber: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || (/^\d+$/.test(value) && Number(value) > 0),
      "Enter a positive week number.",
    ),
});

export type TopicInput = z.infer<typeof topicSchema>;
