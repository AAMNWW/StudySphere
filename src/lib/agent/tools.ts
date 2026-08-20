import { tool } from "@langchain/core/tools";
import { z } from "zod";

import { db } from "@/lib/db";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeZone: "UTC",
});

/**
 * Builds the tool set for one study-planner run, scoped to a single course.
 *
 * `courseId` is captured here via closure — deliberately never a field on
 * any tool's schema, and never something the model supplies as an argument.
 * An LLM should never be trusted to provide the tenant-scoping boundary: if
 * courseId were a tool argument, a prompt-injection payload hidden in an
 * assignment title or a past quiz question (both are untrusted, model-
 * visible text) could try to talk the agent into reading or writing a
 * different course's data. Binding it server-side, before the model ever
 * sees a prompt, closes that off entirely.
 */
export function buildStudyPlannerTools(courseId: string) {
  const getUpcomingAssignments = tool(
    async () => {
      const assignments = await db.assignment.findMany({
        where: { courseId, completed: false, dueDate: { not: null } },
        orderBy: { dueDate: "asc" },
        take: 10,
      });

      if (assignments.length === 0) {
        return "No upcoming assignments.";
      }

      return assignments
        .map((a) => `- ${a.title} (due ${dateFormatter.format(a.dueDate!)})`)
        .join("\n");
    },
    {
      name: "get_upcoming_assignments",
      description:
        "Lists this course's incomplete assignments that have a due date, soonest first.",
      schema: z.object({}),
    },
  );

  const getWeakTopics = tool(
    async () => {
      const wrongAnswers = await db.quizAnswerLog.groupBy({
        by: ["topic"],
        where: { courseId, isCorrect: false, topic: { not: null } },
        _count: { _all: true },
        orderBy: { _count: { topic: "desc" } },
        take: 10,
      });

      if (wrongAnswers.length === 0) {
        return "No quiz history with wrong answers on a specific topic yet.";
      }

      return wrongAnswers
        .map((row) => `- "${row.topic}" — missed ${row._count._all} question(s)`)
        .join("\n");
    },
    {
      name: "get_weak_topics",
      description:
        "Lists topics the student has gotten quiz questions wrong on in this " +
        "course, ranked by how many wrong answers each has, most first.",
      schema: z.object({}),
    },
  );

  const addStudyTopic = tool(
    async ({ title, description, weekNumber }) => {
      await db.topic.create({
        data: {
          courseId,
          title,
          description,
          weekNumber: weekNumber ?? null,
          source: "AI",
        },
      });

      return `Added study topic "${title}".`;
    },
    {
      name: "add_study_topic",
      description:
        "Adds one topic to the student's weekly study plan for this course. " +
        "Call this once per topic you recommend — call it multiple times for " +
        "multiple topics, don't try to combine them into one call.",
      schema: z.object({
        title: z.string().min(1).max(150).describe("A short topic name."),
        description: z
          .string()
          .min(1)
          .max(1000)
          .describe("One or two sentences on what to focus on and why."),
        // .min(1) rather than .positive(): Gemini's function-calling schema
        // format is a restricted subset of JSON Schema that rejects
        // "exclusiveMinimum" (what .positive() generates) with a 400 —
        // confirmed live, not a guess. .min() emits plain "minimum", which
        // is supported.
        weekNumber: z
          .number()
          .int()
          .min(1)
          .optional()
          .describe("Which study week this belongs to, if it's obvious from context."),
      }),
    },
  );

  return [getUpcomingAssignments, getWeakTopics, addStudyTopic];
}
