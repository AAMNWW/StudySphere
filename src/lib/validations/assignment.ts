import { z } from "zod";

import { AssignmentPriority } from "@/generated/prisma/enums";

import { gradeFieldsSchema } from "./grade";

/**
 * Shared validation rules for assignment input. Defined once so the same
 * limits apply everywhere an assignment can be created or edited.
 */
export const assignmentSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Title is required.")
      .max(100, "Title must be 100 characters or fewer."),
    description: z
      .string()
      .trim()
      .max(2000, "Description must be 2,000 characters or fewer."),
    // Comes from an <input type="date">, so either "" (no due date) or
    // "YYYY-MM-DD".
    dueDate: z
      .string()
      .trim()
      .refine(
        (value) => value === "" || !Number.isNaN(Date.parse(value)),
        "Enter a valid date.",
      ),
    priority: z.enum(AssignmentPriority),
  })
  .extend(gradeFieldsSchema.shape);

export type AssignmentInput = z.infer<typeof assignmentSchema>;
