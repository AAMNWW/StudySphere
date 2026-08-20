"use server";

import { revalidatePath } from "next/cache";

import { indexDocument } from "@/lib/rag/index-document";
import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/db";

import type { AsyncActionFormState } from "../../async-action-state";

export async function indexDocumentAction(
  courseId: string,
  documentId: string,
  previousState: AsyncActionFormState,
): Promise<AsyncActionFormState> {
  const userId = await requireUserId();
  const submission = previousState.submission + 1;

  const document = await db.document.findFirst({
    where: { id: documentId, courseId, course: { userId } },
  });

  if (!document) {
    return { submission, status: "error", message: "Document not found." };
  }

  try {
    await indexDocument(documentId);
  } catch (error) {
    console.error("Failed to index document for RAG search", error);
    return {
      submission,
      status: "error",
      message: "Could not index this document. Please try again.",
    };
  }

  revalidatePath(`/courses/${courseId}/documents/${documentId}`);
  return { submission, status: "success" };
}
