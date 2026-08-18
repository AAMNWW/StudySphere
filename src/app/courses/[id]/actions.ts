"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import { assignmentSchema } from "@/lib/validations/assignment";
import { noteSchema } from "@/lib/validations/note";

import type { AssignmentFormState } from "./assignment-form-state";
import type { NoteFormState } from "./note-form-state";

export async function createNote(
  courseId: string,
  previousState: NoteFormState,
  formData: FormData,
): Promise<NoteFormState> {
  const userId = await requireUserId();
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

  // A course id owned by someone else should behave like one that doesn't
  // exist, not leak whether it exists.
  const course = await db.course.findFirst({
    where: { id: courseId, userId },
    select: { id: true },
  });

  if (!course) {
    return {
      submission,
      status: "error",
      message: "Could not save the note. Please try again.",
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

export async function updateNote(
  courseId: string,
  noteId: string,
  previousState: NoteFormState,
  formData: FormData,
): Promise<NoteFormState> {
  const userId = await requireUserId();
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
    // Filtering on the owning course's userId doubles as the ownership
    // check: it silently matches zero rows for a note that isn't this
    // user's, whether because the note or the course id is wrong.
    const { count } = await db.note.updateMany({
      where: { id: noteId, courseId, course: { userId } },
      data: {
        title: parsed.data.title,
        content: parsed.data.content || null,
      },
    });

    if (count === 0) {
      return {
        submission,
        status: "error",
        message: "Could not save the note. Please try again.",
        values,
      };
    }
  } catch (error) {
    console.error("Failed to update note", error);
    return {
      submission,
      status: "error",
      message: "Could not save the note. Please try again.",
      values,
    };
  }

  revalidatePath(`/courses/${courseId}`);

  // Unlike creating a note, editing should leave the saved values visible
  // rather than clearing the form.
  return { submission, status: "success", values };
}

export async function deleteNote(
  courseId: string,
  noteId: string,
): Promise<void> {
  const userId = await requireUserId();

  await db.note.deleteMany({
    where: { id: noteId, courseId, course: { userId } },
  });

  revalidatePath(`/courses/${courseId}`);
}

export async function createAssignment(
  courseId: string,
  previousState: AssignmentFormState,
  formData: FormData,
): Promise<AssignmentFormState> {
  const userId = await requireUserId();
  const submission = previousState.submission + 1;

  const values = {
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    dueDate: String(formData.get("dueDate") ?? ""),
  };

  const parsed = assignmentSchema.safeParse(values);

  if (!parsed.success) {
    return {
      submission,
      status: "error",
      errors: z.flattenError(parsed.error).fieldErrors,
      values,
    };
  }

  const course = await db.course.findFirst({
    where: { id: courseId, userId },
    select: { id: true },
  });

  if (!course) {
    return {
      submission,
      status: "error",
      message: "Could not save the assignment. Please try again.",
      values,
    };
  }

  try {
    await db.assignment.create({
      data: {
        courseId,
        title: parsed.data.title,
        description: parsed.data.description || null,
        dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      },
    });
  } catch (error) {
    console.error("Failed to create assignment", error);
    return {
      submission,
      status: "error",
      message: "Could not save the assignment. Please try again.",
      values,
    };
  }

  revalidatePath(`/courses/${courseId}`);

  return { submission, status: "success" };
}

export async function updateAssignment(
  courseId: string,
  assignmentId: string,
  previousState: AssignmentFormState,
  formData: FormData,
): Promise<AssignmentFormState> {
  const userId = await requireUserId();
  const submission = previousState.submission + 1;

  const values = {
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    dueDate: String(formData.get("dueDate") ?? ""),
  };

  const parsed = assignmentSchema.safeParse(values);

  if (!parsed.success) {
    return {
      submission,
      status: "error",
      errors: z.flattenError(parsed.error).fieldErrors,
      values,
    };
  }

  try {
    const { count } = await db.assignment.updateMany({
      where: { id: assignmentId, courseId, course: { userId } },
      data: {
        title: parsed.data.title,
        description: parsed.data.description || null,
        dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      },
    });

    if (count === 0) {
      return {
        submission,
        status: "error",
        message: "Could not save the assignment. Please try again.",
        values,
      };
    }
  } catch (error) {
    console.error("Failed to update assignment", error);
    return {
      submission,
      status: "error",
      message: "Could not save the assignment. Please try again.",
      values,
    };
  }

  revalidatePath(`/courses/${courseId}`);

  // Unlike creating an assignment, editing should leave the saved values
  // visible rather than clearing the form.
  return { submission, status: "success", values };
}

export async function deleteAssignment(
  courseId: string,
  assignmentId: string,
): Promise<void> {
  const userId = await requireUserId();

  await db.assignment.deleteMany({
    where: { id: assignmentId, courseId, course: { userId } },
  });

  revalidatePath(`/courses/${courseId}`);
}

export async function setAssignmentCompleted(
  courseId: string,
  assignmentId: string,
  completed: boolean,
): Promise<void> {
  const userId = await requireUserId();

  await db.assignment.updateMany({
    where: { id: assignmentId, courseId, course: { userId } },
    data: { completed },
  });

  revalidatePath(`/courses/${courseId}`);
}
