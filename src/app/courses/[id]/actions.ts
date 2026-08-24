"use server";

import crypto from "node:crypto";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getAssignmentHelp } from "@/lib/ai/assignment-help";
import { summarizeDocument } from "@/lib/ai/summarize-document";
import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  ALLOWED_FILE_TYPES,
  deleteUploadedFile,
  MAX_FILE_SIZE_BYTES,
  readUploadedFile,
  saveUploadedFile,
} from "@/lib/uploads";
import { assignmentSchema } from "@/lib/validations/assignment";
import { examSchema } from "@/lib/validations/exam";
import { parseGradeFields } from "@/lib/validations/grade";
import { noteSchema } from "@/lib/validations/note";

import type { AssignmentFormState } from "./assignment-form-state";
import type { AssignmentHelpFormState } from "./assignment-help-form-state";
import type { DocumentFormState } from "./document-form-state";
import type { ExamFormState } from "./exam-form-state";
import type { NoteFormState } from "./note-form-state";
import type { SummarizeDocumentFormState } from "./summarize-document-form-state";

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
    priority: String(formData.get("priority") ?? "MEDIUM"),
    earnedPoints: String(formData.get("earnedPoints") ?? ""),
    maxPoints: String(formData.get("maxPoints") ?? ""),
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
        priority: parsed.data.priority,
        ...parseGradeFields(parsed.data),
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
    priority: String(formData.get("priority") ?? "MEDIUM"),
    earnedPoints: String(formData.get("earnedPoints") ?? ""),
    maxPoints: String(formData.get("maxPoints") ?? ""),
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
        priority: parsed.data.priority,
        ...parseGradeFields(parsed.data),
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
  revalidatePath("/grades");

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
  // The dashboard's "Due soon" list can also toggle completion, so it needs
  // to drop out of that list in place rather than on next full navigation.
  revalidatePath("/");
}

export async function getAssignmentAiHelp(
  courseId: string,
  assignmentId: string,
  previousState: AssignmentHelpFormState,
): Promise<AssignmentHelpFormState> {
  const userId = await requireUserId();
  const submission = previousState.submission + 1;

  const assignment = await db.assignment.findFirst({
    where: { id: assignmentId, courseId, course: { userId } },
    include: { course: { select: { title: true } } },
  });

  if (!assignment) {
    return {
      submission,
      status: "error",
      message: "Could not get help for this assignment. Please try again.",
    };
  }

  try {
    const aiHelp = await getAssignmentHelp(
      assignment.course.title,
      assignment.title,
      assignment.description,
    );

    await db.assignment.update({
      where: { id: assignment.id },
      data: { aiHelp, aiHelpError: null },
    });
  } catch (error) {
    console.error("Failed to get AI help for assignment", error);

    await db.assignment.update({
      where: { id: assignment.id },
      data: { aiHelpError: "Could not get AI help right now. Please try again." },
    });

    revalidatePath(`/courses/${courseId}`);

    return {
      submission,
      status: "error",
      message: "Could not get AI help right now. Please try again.",
    };
  }

  revalidatePath(`/courses/${courseId}`);

  return { submission, status: "success" };
}

export async function createExam(
  courseId: string,
  previousState: ExamFormState,
  formData: FormData,
): Promise<ExamFormState> {
  const userId = await requireUserId();
  const submission = previousState.submission + 1;

  const values = {
    title: String(formData.get("title") ?? ""),
    examDate: String(formData.get("examDate") ?? ""),
    notes: String(formData.get("notes") ?? ""),
    earnedPoints: String(formData.get("earnedPoints") ?? ""),
    maxPoints: String(formData.get("maxPoints") ?? ""),
  };

  const parsed = examSchema.safeParse(values);

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
      message: "Could not save the exam. Please try again.",
      values,
    };
  }

  try {
    await db.exam.create({
      data: {
        courseId,
        userId,
        title: parsed.data.title,
        examDate: new Date(parsed.data.examDate),
        notes: parsed.data.notes || null,
        ...parseGradeFields(parsed.data),
      },
    });
  } catch (error) {
    console.error("Failed to create exam", error);
    return {
      submission,
      status: "error",
      message: "Could not save the exam. Please try again.",
      values,
    };
  }

  revalidatePath(`/courses/${courseId}`);
  revalidatePath("/grades");

  return { submission, status: "success" };
}

export async function updateExam(
  courseId: string,
  examId: string,
  previousState: ExamFormState,
  formData: FormData,
): Promise<ExamFormState> {
  const userId = await requireUserId();
  const submission = previousState.submission + 1;

  const values = {
    title: String(formData.get("title") ?? ""),
    examDate: String(formData.get("examDate") ?? ""),
    notes: String(formData.get("notes") ?? ""),
    earnedPoints: String(formData.get("earnedPoints") ?? ""),
    maxPoints: String(formData.get("maxPoints") ?? ""),
  };

  const parsed = examSchema.safeParse(values);

  if (!parsed.success) {
    return {
      submission,
      status: "error",
      errors: z.flattenError(parsed.error).fieldErrors,
      values,
    };
  }

  try {
    const { count } = await db.exam.updateMany({
      where: { id: examId, courseId, userId },
      data: {
        title: parsed.data.title,
        examDate: new Date(parsed.data.examDate),
        notes: parsed.data.notes || null,
        ...parseGradeFields(parsed.data),
      },
    });

    if (count === 0) {
      return {
        submission,
        status: "error",
        message: "Could not save the exam. Please try again.",
        values,
      };
    }
  } catch (error) {
    console.error("Failed to update exam", error);
    return {
      submission,
      status: "error",
      message: "Could not save the exam. Please try again.",
      values,
    };
  }

  revalidatePath(`/courses/${courseId}`);
  revalidatePath("/grades");

  return { submission, status: "success", values };
}

export async function deleteExam(courseId: string, examId: string): Promise<void> {
  const userId = await requireUserId();

  await db.exam.deleteMany({
    where: { id: examId, courseId, userId },
  });

  revalidatePath(`/courses/${courseId}`);
}

function generateShareToken(): string {
  return crypto.randomBytes(24).toString("hex");
}

/** Turns on the read-only share link for a course, if it isn't already on.
 * Idempotent — calling this on an already-shared course is a no-op rather
 * than an error, since the UI just shows one enabled/disabled state. */
export async function enableCourseShare(courseId: string): Promise<void> {
  const userId = await requireUserId();

  const course = await db.course.findFirst({
    where: { id: courseId, userId },
    select: { id: true },
  });

  if (!course) {
    return;
  }

  await db.courseShare.upsert({
    where: { courseId },
    update: {},
    create: { courseId, token: generateShareToken() },
  });

  revalidatePath(`/courses/${courseId}/settings`);
}

/** Invalidates the existing link (if any) and issues a new one — for when
 * a student wants to revoke access without turning sharing off entirely. */
export async function regenerateCourseShare(courseId: string): Promise<void> {
  const userId = await requireUserId();

  const course = await db.course.findFirst({
    where: { id: courseId, userId },
    select: { id: true },
  });

  if (!course) {
    return;
  }

  await db.courseShare.upsert({
    where: { courseId },
    update: { token: generateShareToken() },
    create: { courseId, token: generateShareToken() },
  });

  revalidatePath(`/courses/${courseId}/settings`);
}

export async function disableCourseShare(courseId: string): Promise<void> {
  const userId = await requireUserId();

  await db.courseShare.deleteMany({
    where: { courseId, course: { userId } },
  });

  revalidatePath(`/courses/${courseId}/settings`);
}

export async function uploadDocument(
  courseId: string,
  previousState: DocumentFormState,
  formData: FormData,
): Promise<DocumentFormState> {
  const userId = await requireUserId();
  const submission = previousState.submission + 1;

  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return {
      submission,
      status: "error",
      message: "Choose a file to upload.",
    };
  }

  if (!(file.type in ALLOWED_FILE_TYPES)) {
    return {
      submission,
      status: "error",
      message: "Only PDF, Word (.docx) and PowerPoint (.pptx) files are supported.",
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      submission,
      status: "error",
      message: `Files must be ${MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB or smaller.`,
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
      message: "Could not save the file. Please try again.",
    };
  }

  try {
    const { storedName, storageUrl } = await saveUploadedFile(courseId, file);

    await db.document.create({
      data: {
        courseId,
        fileName: file.name,
        storedName,
        storageUrl,
        mimeType: file.type,
        sizeBytes: file.size,
      },
    });
  } catch (error) {
    console.error("Failed to save uploaded file", error);
    return {
      submission,
      status: "error",
      message: "Could not save the file. Please try again.",
    };
  }

  revalidatePath(`/courses/${courseId}/documents`);
  revalidatePath(`/courses/${courseId}`);

  return { submission, status: "success" };
}

/** Records a document whose bytes were already uploaded directly from the
 * browser to Vercel Blob (see UploadDocumentForm + src/app/api/documents/upload) —
 * used instead of {@link uploadDocument} whenever Blob storage is configured,
 * since routing the file through this Server Action would hit Vercel's
 * ~4.5MB Function request-body cap well before the app's own 15MB limit. */
export async function finalizeDocumentUpload(
  courseId: string,
  file: { fileName: string; storedName: string; storageUrl: string; mimeType: string; sizeBytes: number },
): Promise<{ status: "success" } | { status: "error"; message: string }> {
  const userId = await requireUserId();

  const course = await db.course.findFirst({
    where: { id: courseId, userId },
    select: { id: true },
  });

  if (!course) {
    return { status: "error", message: "Could not save the file. Please try again." };
  }

  try {
    await db.document.create({
      data: {
        courseId,
        fileName: file.fileName,
        storedName: file.storedName,
        storageUrl: file.storageUrl,
        mimeType: file.mimeType,
        sizeBytes: file.sizeBytes,
      },
    });
  } catch (error) {
    console.error("Failed to save uploaded file", error);
    return { status: "error", message: "Could not save the file. Please try again." };
  }

  revalidatePath(`/courses/${courseId}/documents`);
  revalidatePath(`/courses/${courseId}`);

  return { status: "success" };
}

export async function deleteDocument(
  courseId: string,
  documentId: string,
): Promise<void> {
  const userId = await requireUserId();

  const document = await db.document.findFirst({
    where: { id: documentId, courseId, course: { userId } },
  });

  if (!document) {
    return;
  }

  await db.document.delete({ where: { id: document.id } });
  await deleteUploadedFile(document);

  revalidatePath(`/courses/${courseId}/documents`);
  revalidatePath(`/courses/${courseId}`);
}

export async function generateDocumentSummary(
  courseId: string,
  documentId: string,
  previousState: SummarizeDocumentFormState,
): Promise<SummarizeDocumentFormState> {
  const userId = await requireUserId();
  const submission = previousState.submission + 1;

  const document = await db.document.findFirst({
    where: { id: documentId, courseId, course: { userId } },
  });

  if (!document) {
    return {
      submission,
      status: "error",
      message: "Could not summarize the file. Please try again.",
    };
  }

  try {
    const bytes = await readUploadedFile(document);
    const summary = await summarizeDocument(
      bytes,
      document.mimeType,
      document.fileName,
    );

    await db.document.update({
      where: { id: document.id },
      data: { summary, summaryError: null },
    });
  } catch (error) {
    console.error("Failed to summarize document", error);

    await db.document.update({
      where: { id: document.id },
      data: {
        summaryError: "Could not summarize this file. Please try again.",
      },
    });

    revalidatePath(`/courses/${courseId}/documents`);

    return {
      submission,
      status: "error",
      message: "Could not summarize the file. Please try again.",
    };
  }

  revalidatePath(`/courses/${courseId}/documents`);

  return { submission, status: "success" };
}
