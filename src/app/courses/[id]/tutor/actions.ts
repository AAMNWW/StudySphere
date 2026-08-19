"use server";

import { revalidatePath } from "next/cache";

import { answerTutorMessage } from "@/lib/ai/chat";
import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/db";

import type { AsyncActionFormState } from "../async-action-state";

export async function sendTutorMessage(
  courseId: string,
  previousState: AsyncActionFormState,
  formData: FormData,
): Promise<AsyncActionFormState> {
  const userId = await requireUserId();
  const submission = previousState.submission + 1;
  const message = String(formData.get("message") ?? "").trim();

  if (!message) {
    return { submission, status: "error", message: "Type a question first." };
  }

  const course = await db.course.findFirst({ where: { id: courseId, userId } });

  if (!course) {
    return { submission, status: "error", message: "Course not found." };
  }

  let thread = await db.chatThread.findFirst({
    where: { courseId, documentId: null },
  });
  thread ??= await db.chatThread.create({
    data: { courseId, title: `AI tutor — ${course.title}` },
  });

  await db.chatMessage.create({
    data: { threadId: thread.id, role: "user", content: message },
  });

  const priorMessages = await db.chatMessage.findMany({
    where: { threadId: thread.id },
    orderBy: { createdAt: "asc" },
  });

  try {
    const history = priorMessages.slice(0, -1).map((entry) => ({
      role: entry.role as "user" | "assistant",
      content: entry.content,
    }));
    const answer = await answerTutorMessage(course.title, history, message);

    await db.chatMessage.create({
      data: { threadId: thread.id, role: "assistant", content: answer },
    });
  } catch (error) {
    console.error("Failed to answer tutor message", error);
    revalidatePath(`/courses/${courseId}/tutor`);
    return {
      submission,
      status: "error",
      message: "Could not get a response. Please try again.",
    };
  }

  revalidatePath(`/courses/${courseId}/tutor`);
  return { submission, status: "success" };
}
