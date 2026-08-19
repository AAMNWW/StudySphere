"use server";

import { readFile } from "node:fs/promises";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { answerChatMessage } from "@/lib/ai/chat";
import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import { getUploadedFilePath } from "@/lib/uploads";
import { generateChatSchema } from "@/lib/validations/generate-content";

import type { AsyncActionFormState } from "../async-action-state";
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

  if (parsed.data.documentIds.length > 0) {
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

  const title = parsed.data.topic
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
      title,
    },
  });

  revalidatePath(`/courses/${courseId}/chat`);
  redirect(`/courses/${courseId}/chat/${thread.id}`);
}

export async function sendChatMessage(
  courseId: string,
  threadId: string,
  previousState: AsyncActionFormState,
  formData: FormData,
): Promise<AsyncActionFormState> {
  const userId = await requireUserId();
  const submission = previousState.submission + 1;
  const message = String(formData.get("message") ?? "").trim();

  if (!message) {
    return { submission, status: "error", message: "Type a question first." };
  }

  const thread = await db.chatThread.findFirst({
    where: { id: threadId, courseId, course: { userId } },
    include: { course: true },
  });

  if (!thread) {
    return { submission, status: "error", message: "Chat not found." };
  }

  await db.chatMessage.create({
    data: { threadId: thread.id, role: "user", content: message },
  });

  const priorMessages = await db.chatMessage.findMany({
    where: { threadId: thread.id },
    orderBy: { createdAt: "asc" },
  });

  try {
    const sourceDocumentIds = thread.documentId
      ? [thread.documentId]
      : (thread.sourceDocumentIds as string[]);

    const documents =
      sourceDocumentIds.length > 0
        ? await db.document.findMany({ where: { id: { in: sourceDocumentIds }, courseId } })
        : [];

    const sourceDocuments = await Promise.all(
      documents.map(async (document) => ({
        bytes: await readFile(getUploadedFilePath(document.courseId, document.storedName)),
        mimeType: document.mimeType,
        fileName: document.fileName,
      })),
    );

    // The message just inserted is the last row, so everything before it is
    // "prior" history and the new question is passed separately.
    const history = priorMessages.slice(0, -1).map((entry) => ({
      role: entry.role as "user" | "assistant",
      content: entry.content,
    }));

    const answer = await answerChatMessage(
      sourceDocuments,
      thread.course.title,
      history,
      message,
      thread.topic ?? undefined,
    );

    await db.chatMessage.create({
      data: { threadId: thread.id, role: "assistant", content: answer },
    });
  } catch (error) {
    console.error("Failed to answer chat message", error);
    revalidatePath(`/courses/${courseId}/chat/${threadId}`);
    return {
      submission,
      status: "error",
      message: "Could not get a response. Please try again.",
    };
  }

  revalidatePath(`/courses/${courseId}/chat/${threadId}`);
  return { submission, status: "success" };
}

export async function deleteChatThread(courseId: string, threadId: string): Promise<void> {
  const userId = await requireUserId();

  await db.chatThread.deleteMany({ where: { id: threadId, courseId, course: { userId } } });

  revalidatePath(`/courses/${courseId}/chat`);
}
