"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { isDocumentContentError } from "@/lib/ai/document-content";
import { generateFlashcards } from "@/lib/ai/generate-flashcards";
import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import { readUploadedFile } from "@/lib/uploads";
import { generateFlashcardsSchema } from "@/lib/validations/generate-content";

import type { GenerationFormState } from "../generation-form-state";

export async function generateFlashcardSet(
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

  const parsed = generateFlashcardsSchema.safeParse(values);

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

  let setId: string;

  try {
    const sourceDocuments = await Promise.all(
      documents.map(async (document) => ({
        bytes: await readUploadedFile(document),
        mimeType: document.mimeType,
        fileName: document.fileName,
      })),
    );

    const cards = await generateFlashcards(sourceDocuments, {
      topic: parsed.data.topic || undefined,
    });

    const title = parsed.data.topic
      ? `Flashcards — ${parsed.data.topic}`
      : documents.length === 1
        ? `Flashcards — ${documents[0].fileName}`
        : `Flashcards — ${documents.length} documents`;

    const set = await db.flashcardSet.create({
      data: {
        courseId,
        documentId: documents.length === 1 ? documents[0].id : null,
        sourceDocumentIds: documents.map((document) => document.id),
        topic: parsed.data.topic || null,
        title,
        cards: {
          create: cards.map((card, index) => ({
            front: card.front,
            back: card.back,
            order: index,
          })),
        },
      },
    });
    setId = set.id;
  } catch (error) {
    console.error("Failed to generate flashcards", error);
    return {
      submission,
      status: "error",
      message: isDocumentContentError(error)
        ? error.message
        : "Could not generate flashcards. Please try again.",
      values,
    };
  }

  revalidatePath(`/courses/${courseId}/flashcards`);
  redirect(`/courses/${courseId}/flashcards/${setId}`);
}

export async function deleteFlashcardSet(courseId: string, setId: string): Promise<void> {
  const userId = await requireUserId();

  await db.flashcardSet.deleteMany({ where: { id: setId, courseId, course: { userId } } });

  revalidatePath(`/courses/${courseId}/flashcards`);
}
