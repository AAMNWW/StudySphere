"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/lib/db";
import { noteSchema } from "@/lib/validations/note";

import type { NoteFormState } from "./note-form-state";

export async function createNote(
  courseId: string,
  previousState: NoteFormState,
  formData: FormData,
): Promise<NoteFormState> {
  const submission = previousState.submission + 1;

  const values = {
    title: String(formData.get("title") ?? ""),
    content: String(formData.get("content") ?? ""),
  };

  const parsed = noteSchema.safeParse(values);

  if (!parsed.success) {
    return {
      submission,
      status: "error",
      errors: z.flattenError(parsed.error).fieldErrors,
      values,
    };
  }

  try {
    await db.note.create({
      data: {
        courseId,
        title: parsed.data.title,
        // Store absent content as NULL rather than an empty string, so
        // "no content" has exactly one representation in the database.
        content: parsed.data.content || null,
      },
    });
  } catch (error) {
    console.error("Failed to create note", error);
    return {
      submission,
      status: "error",
      message: "Could not save the note. Please try again.",
      values,
    };
  }

  // The notes list lives on the course detail page, so that's what needs to
  // re-render with the new note included.
  revalidatePath(`/courses/${courseId}`);

  return { submission, status: "success" };
}

export async function deleteNote(
  courseId: string,
  noteId: string,
): Promise<void> {
  await db.note.delete({ where: { id: noteId } });

  revalidatePath(`/courses/${courseId}`);
}
