import { z } from "zod";

/** Shared by assignmentSchema and examSchema — both a grade field pair, so
 * one number-input format validation covers both. Empty string means "not
 * graded"; the pair not agreeing (one set, one blank) is allowed, since
 * "I know it's out of 100 points but haven't gotten it back yet" is a
 * legitimate state — src/lib/grades.ts only counts an item once both are set.
 */
export const gradeFieldsSchema = z.object({
  earnedPoints: z
    .string()
    .trim()
    .refine((value) => value === "" || !Number.isNaN(Number(value)), "Enter a valid number."),
  maxPoints: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || (!Number.isNaN(Number(value)) && Number(value) > 0),
      "Enter a valid number.",
    ),
});

export type GradeFieldsInput = z.infer<typeof gradeFieldsSchema>;

/** Converts the raw string pair into the nullable numbers Assignment/Exam
 * store, for use in a Prisma `data` object after schema validation. */
export function parseGradeFields(values: GradeFieldsInput): {
  earnedPoints: number | null;
  maxPoints: number | null;
} {
  return {
    earnedPoints: values.earnedPoints === "" ? null : Number(values.earnedPoints),
    maxPoints: values.maxPoints === "" ? null : Number(values.maxPoints),
  };
}
