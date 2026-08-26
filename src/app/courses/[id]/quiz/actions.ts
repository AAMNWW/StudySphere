"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import type { Prisma } from "@/generated/prisma/client";
import { DocumentContentError } from "@/lib/ai/document-content";
import { generateQuizQuestions } from "@/lib/ai/generate-quiz";
import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import { readUploadedFile } from "@/lib/uploads";
import { generateQuizSchema } from "@/lib/validations/generate-content";

import type { GenerationFormState } from "../generation-form-state";

export async function generateQuiz(
  courseId: string,
  previousState: GenerationFormState,
  formData: FormData,
): Promise<GenerationFormState> {
  const userId = await requireUserId();
  const submission = previousState.submission + 1;

  const values = {
    documentIds: formData.getAll("documentIds").map(String),
    topic: String(formData.get("topic") ?? ""),
    difficulty: String(formData.get("difficulty") ?? "MEDIUM"),
  };

  const parsed = generateQuizSchema.safeParse(values);

  if (!parsed.success) {
    return {
      submission,
      status: "error",
      errors: z.flattenError(parsed.error).fieldErrors,
      values,
    };
  }

  const documents = await db.document.findMany({
    where: { id: { in: parsed.data.documentIds }, courseId, course: { userId } },
  });

  if (documents.length !== parsed.data.documentIds.length) {
    return {
      submission,
      status: "error",
      message: "One or more documents could not be found.",
      values,
    };
  }

  let quizId: string;

  try {
    const sourceDocuments = await Promise.all(
      documents.map(async (document) => ({
        bytes: await readUploadedFile(document),
        mimeType: document.mimeType,
        fileName: document.fileName,
      })),
    );

    const questions = await generateQuizQuestions(sourceDocuments, {
      difficulty: parsed.data.difficulty,
      topic: parsed.data.topic || undefined,
    });

    const title = parsed.data.topic
      ? `Quiz — ${parsed.data.topic}`
      : documents.length === 1
        ? `Quiz — ${documents[0].fileName}`
        : `Quiz — ${documents.length} documents`;

    const quiz = await db.quiz.create({
      data: {
        courseId,
        documentId: documents.length === 1 ? documents[0].id : null,
        sourceDocumentIds: documents.map((document) => document.id),
        topic: parsed.data.topic || null,
        difficulty: parsed.data.difficulty,
        title,
        questions: {
          create: questions.map((question, index) => ({
            question: question.question,
            options: question.options,
            correctIndex: question.correctIndex,
            order: index,
          })),
        },
      },
    });
    quizId = quiz.id;
  } catch (error) {
    console.error("Failed to generate quiz", error);
    return {
      submission,
      status: "error",
      message:
        error instanceof DocumentContentError
          ? error.message
          : "Could not generate a quiz. Please try again.",
      values,
    };
  }

  revalidatePath(`/courses/${courseId}/quiz`);
  redirect(`/courses/${courseId}/quiz/${quizId}`);
}

export async function submitQuizAnswer(
  courseId: string,
  quizId: string,
  questionId: string,
  selectedIndex: number,
): Promise<void> {
  const userId = await requireUserId();

  const question = await db.quizQuestion.findFirst({
    where: { id: questionId, quizId, quiz: { courseId, course: { userId } } },
    include: { quiz: true },
  });

  if (!question) {
    return;
  }

  await db.$transaction([
    db.quizQuestion.update({ where: { id: questionId }, data: { selectedIndex } }),
    db.quizAnswerLog.create({
      data: {
        userId,
        courseId,
        quizId,
        topic: question.quiz.topic,
        difficulty: question.quiz.difficulty,
        question: question.question,
        options: question.options as Prisma.InputJsonValue,
        correctIndex: question.correctIndex,
        selectedIndex,
        isCorrect: selectedIndex === question.correctIndex,
      },
    }),
  ]);

  revalidatePath(`/courses/${courseId}/quiz/${quizId}`);
}

export async function deleteQuiz(courseId: string, quizId: string): Promise<void> {
  const userId = await requireUserId();

  await db.quiz.deleteMany({ where: { id: quizId, courseId, course: { userId } } });

  revalidatePath(`/courses/${courseId}/quiz`);
}
