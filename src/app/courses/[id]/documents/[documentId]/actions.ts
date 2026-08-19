"use server";

import { readFile } from "node:fs/promises";

import { revalidatePath } from "next/cache";

import { answerDocumentChatMessage } from "@/lib/ai/chat";
import { generateFlashcards } from "@/lib/ai/generate-flashcards";
import { generateQuizQuestions } from "@/lib/ai/generate-quiz";
import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import { getUploadedFilePath } from "@/lib/uploads";

import type { AsyncActionFormState } from "../../async-action-state";

async function findOwnedDocument(courseId: string, documentId: string, userId: string) {
  return db.document.findFirst({
    where: { id: documentId, courseId, course: { userId } },
  });
}

export async function sendDocumentChatMessage(
  courseId: string,
  documentId: string,
  previousState: AsyncActionFormState,
  formData: FormData,
): Promise<AsyncActionFormState> {
  const userId = await requireUserId();
  const submission = previousState.submission + 1;
  const message = String(formData.get("message") ?? "").trim();

  if (!message) {
    return { submission, status: "error", message: "Type a question first." };
  }

  const document = await findOwnedDocument(courseId, documentId, userId);

  if (!document) {
    return { submission, status: "error", message: "Document not found." };
  }

  let thread = await db.chatThread.findFirst({ where: { courseId, documentId } });
  thread ??= await db.chatThread.create({
    data: { courseId, documentId, title: `Chat about ${document.fileName}` },
  });

  await db.chatMessage.create({
    data: { threadId: thread.id, role: "user", content: message },
  });

  const priorMessages = await db.chatMessage.findMany({
    where: { threadId: thread.id },
    orderBy: { createdAt: "asc" },
  });

  try {
    const bytes = await readFile(
      getUploadedFilePath(document.courseId, document.storedName),
    );
    // The message just inserted is the last row, so everything before it is
    // "prior" history and the new question is passed separately.
    const history = priorMessages.slice(0, -1).map((entry) => ({
      role: entry.role as "user" | "assistant",
      content: entry.content,
    }));
    const answer = await answerDocumentChatMessage(
      bytes,
      document.mimeType,
      document.fileName,
      history,
      message,
    );

    await db.chatMessage.create({
      data: { threadId: thread.id, role: "assistant", content: answer },
    });
  } catch (error) {
    console.error("Failed to answer document chat message", error);
    revalidatePath(`/courses/${courseId}/documents/${documentId}`);
    return {
      submission,
      status: "error",
      message: "Could not get a response. Please try again.",
    };
  }

  revalidatePath(`/courses/${courseId}/documents/${documentId}`);
  return { submission, status: "success" };
}

export async function generateQuiz(
  courseId: string,
  documentId: string,
  previousState: AsyncActionFormState,
): Promise<AsyncActionFormState> {
  const userId = await requireUserId();
  const submission = previousState.submission + 1;
  const document = await findOwnedDocument(courseId, documentId, userId);

  if (!document) {
    return { submission, status: "error", message: "Document not found." };
  }

  try {
    const bytes = await readFile(
      getUploadedFilePath(document.courseId, document.storedName),
    );
    const questions = await generateQuizQuestions(
      bytes,
      document.mimeType,
      document.fileName,
    );

    await db.$transaction([
      db.quiz.deleteMany({ where: { documentId } }),
      db.quiz.create({
        data: {
          courseId,
          documentId,
          title: `Quiz — ${document.fileName}`,
          questions: {
            create: questions.map((question, index) => ({
              question: question.question,
              options: question.options,
              correctIndex: question.correctIndex,
              order: index,
            })),
          },
        },
      }),
    ]);
  } catch (error) {
    console.error("Failed to generate quiz", error);
    return {
      submission,
      status: "error",
      message: "Could not generate a quiz. Please try again.",
    };
  }

  revalidatePath(`/courses/${courseId}/documents/${documentId}`);
  return { submission, status: "success" };
}

export async function generateFlashcardSet(
  courseId: string,
  documentId: string,
  previousState: AsyncActionFormState,
): Promise<AsyncActionFormState> {
  const userId = await requireUserId();
  const submission = previousState.submission + 1;
  const document = await findOwnedDocument(courseId, documentId, userId);

  if (!document) {
    return { submission, status: "error", message: "Document not found." };
  }

  try {
    const bytes = await readFile(
      getUploadedFilePath(document.courseId, document.storedName),
    );
    const cards = await generateFlashcards(
      bytes,
      document.mimeType,
      document.fileName,
    );

    await db.$transaction([
      db.flashcardSet.deleteMany({ where: { documentId } }),
      db.flashcardSet.create({
        data: {
          courseId,
          documentId,
          title: `Flashcards — ${document.fileName}`,
          cards: {
            create: cards.map((card, index) => ({
              front: card.front,
              back: card.back,
              order: index,
            })),
          },
        },
      }),
    ]);
  } catch (error) {
    console.error("Failed to generate flashcards", error);
    return {
      submission,
      status: "error",
      message: "Could not generate flashcards. Please try again.",
    };
  }

  revalidatePath(`/courses/${courseId}/documents/${documentId}`);
  return { submission, status: "success" };
}

export async function submitQuizAnswer(
  courseId: string,
  documentId: string,
  quizId: string,
  questionId: string,
  selectedIndex: number,
): Promise<void> {
  const userId = await requireUserId();

  await db.quizQuestion.updateMany({
    where: {
      id: questionId,
      quizId,
      quiz: { documentId, document: { course: { userId } } },
    },
    data: { selectedIndex },
  });

  revalidatePath(`/courses/${courseId}/documents/${documentId}`);
}
