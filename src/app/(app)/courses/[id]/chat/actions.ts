"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateChatSchema } from "@/lib/validations/generate-content";

import type { GenerationFormState } from "../generation-form-state";

export async function createChatThread(
  courseId: string,
  previousState: GenerationFormState,
  formData: FormData,
): Promise<GenerationFormState> {
  const userId = await requireUserId();
  const submission = previousState.submission + 1;

  const values = {
    documentIds: formData.getAll("documentIds").map(String),
    topic: String(formData.get("topic") ?? ""),
    ragMode: formData.get("ragMode") === "on",
  };

  const parsed = generateChatSchema.safeParse(values);

  if (!parsed.success) {
    return {
      submission,
      status: "error",
      errors: z.flattenError(parsed.error).fieldErrors,
      values,
    };
  }

  const course = await db.course.findFirst({ where: { id: courseId, userId } });

  if (!course) {
    return { submission, status: "error", message: "Course not found.", values };
  }

  let documents: { id: string; fileName: string }[] = [];

  // RAG mode searches across every indexed document automatically, so a
  // hand-picked document selection doesn't apply — skip resolving it even
  // if the (now-hidden) picker somehow still submitted values.
  if (!parsed.data.ragMode && parsed.data.documentIds.length > 0) {
    documents = await db.document.findMany({
      where: { id: { in: parsed.data.documentIds }, courseId, course: { userId } },
      select: { id: true, fileName: true },
    });

    if (documents.length !== parsed.data.documentIds.length) {
      return {
        submission,
        status: "error",
        message: "One or more documents could not be found.",
        values,
      };
    }
  }

  const title = parsed.data.ragMode
    ? `Ask across ${course.title}`
    : parsed.data.topic
      ? `Chat — ${parsed.data.topic}`
      : documents.length === 1
        ? `Chat — ${documents[0].fileName}`
        : documents.length > 1
          ? `Chat — ${documents.length} documents`
          : `Chat — ${course.title}`;

  const thread = await db.chatThread.create({
    data: {
      courseId,
      documentId: documents.length === 1 ? documents[0].id : null,
      sourceDocumentIds: documents.map((document) => document.id),
      topic: parsed.data.topic || null,
      ragMode: parsed.data.ragMode,
      title,
    },
  });

  revalidatePath(`/courses/${courseId}/chat`);
  redirect(`/courses/${courseId}/chat/${thread.id}`);
}

export async function deleteChatThread(courseId: string, threadId: string): Promise<void> {
  const userId = await requireUserId();

  await db.chatThread.deleteMany({ where: { id: threadId, courseId, course: { userId } } });

  revalidatePath(`/courses/${courseId}/chat`);
}
