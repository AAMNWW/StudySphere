"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { suggestCourseTopics, type SuggestedTopic } from "@/lib/ai/suggest-topics";
import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import { readUploadedFile } from "@/lib/uploads";
import { topicSchema } from "@/lib/validations/topic";

import type { TopicFormState } from "./topic-form-state";

export async function createTopic(
  courseId: string,
  previousState: TopicFormState,
  formData: FormData,
): Promise<TopicFormState> {
  const userId = await requireUserId();
  const submission = previousState.submission + 1;

  const values = {
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    weekNumber: String(formData.get("weekNumber") ?? ""),
  };

  const parsed = topicSchema.safeParse(values);

  if (!parsed.success) {
    return {
      submission,
      status: "error",
      errors: z.flattenError(parsed.error).fieldErrors,
      values,
    };
  }

  const course = await db.course.findFirst({ where: { id: courseId, userId }, select: { id: true } });

  if (!course) {
    return {
      submission,
      status: "error",
      message: "Could not save the topic. Please try again.",
      values,
    };
  }

  try {
    await db.topic.create({
      data: {
        courseId,
        title: parsed.data.title,
        description: parsed.data.description || null,
        weekNumber: parsed.data.weekNumber ? Number(parsed.data.weekNumber) : null,
        source: "MANUAL",
      },
    });
  } catch (error) {
    console.error("Failed to create topic", error);
    return {
      submission,
      status: "error",
      message: "Could not save the topic. Please try again.",
      values,
    };
  }

  revalidatePath(`/courses/${courseId}/topics`);

  return { submission, status: "success" };
}

export async function deleteTopic(courseId: string, topicId: string): Promise<void> {
  const userId = await requireUserId();

  await db.topic.deleteMany({ where: { id: topicId, courseId, course: { userId } } });

  revalidatePath(`/courses/${courseId}/topics`);
}

export type SuggestTopicsResult =
  | { status: "success"; topics: SuggestedTopic[] }
  | { status: "error"; message: string };

/**
 * Proposes topics from a course's documents via Gemini. Purely a
 * suggestion — returns data for the client to preview, nothing is
 * persisted until {@link addSuggestedTopics} is called.
 *
 * Returns a result object rather than throwing: a thrown Server Action
 * error has its message redacted by Next.js in production builds (only
 * visible in dev), so a validation message like "choose a document" would
 * arrive at the client as a generic "An error occurred" instead of
 * something a student can act on.
 */
export async function suggestTopics(
  courseId: string,
  documentIds: string[],
): Promise<SuggestTopicsResult> {
  const userId = await requireUserId();

  const documents = await db.document.findMany({
    where: { id: { in: documentIds }, courseId, course: { userId } },
  });

  if (documents.length === 0) {
    return { status: "error", message: "Choose at least one document." };
  }

  try {
    const sourceDocuments = await Promise.all(
      documents.map(async (document) => ({
        bytes: await readUploadedFile(document),
        mimeType: document.mimeType,
        fileName: document.fileName,
      })),
    );

    const topics = await suggestCourseTopics(sourceDocuments);
    return { status: "success", topics };
  } catch (error) {
    console.error("Failed to suggest topics", error);
    return { status: "error", message: "Could not suggest topics. Please try again." };
  }
}

/** Persists AI-suggested topics the student chose to keep. */
export async function addSuggestedTopics(
  courseId: string,
  topics: SuggestedTopic[],
): Promise<void> {
  const userId = await requireUserId();

  const course = await db.course.findFirst({ where: { id: courseId, userId }, select: { id: true } });

  if (!course || topics.length === 0) {
    return;
  }

  await db.topic.createMany({
    data: topics.map((topic) => ({
      courseId,
      title: topic.title,
      description: topic.description,
      source: "AI" as const,
    })),
  });

  revalidatePath(`/courses/${courseId}/topics`);
}
