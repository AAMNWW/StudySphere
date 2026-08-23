"use server";

import { revalidatePath } from "next/cache";

import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import { deleteResumeFile, MAX_FILE_SIZE_BYTES, saveResumeFile } from "@/lib/uploads";
import { resumeTitleSchema } from "@/lib/validations/resume";

import type { ResumeFormState } from "./resume-form-state";

// A resume is never a slide deck — narrower than the course Documents'
// ALLOWED_FILE_TYPES, which also accepts .pptx.
const RESUME_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export async function uploadResume(
  previousState: ResumeFormState,
  formData: FormData,
): Promise<ResumeFormState> {
  const userId = await requireUserId();
  const submission = previousState.submission + 1;

  const values = { title: String(formData.get("title") ?? "") };
  const parsed = resumeTitleSchema.safeParse(values.title);

  if (!parsed.success) {
    return {
      submission,
      status: "error",
      errors: { title: parsed.error.issues.map((issue) => issue.message) },
      values,
    };
  }

  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return { submission, status: "error", message: "Choose a file to upload.", values };
  }

  if (!RESUME_MIME_TYPES.has(file.type)) {
    return {
      submission,
      status: "error",
      message: "Only PDF and Word (.docx) files are supported.",
      values,
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      submission,
      status: "error",
      message: `Files must be ${MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB or smaller.`,
      values,
    };
  }

  try {
    const { storedName, storageUrl } = await saveResumeFile(userId, file);

    await db.resume.create({
      data: {
        userId,
        title: parsed.data,
        fileName: file.name,
        storedName,
        storageUrl,
        mimeType: file.type,
        sizeBytes: file.size,
      },
    });
  } catch (error) {
    console.error("Failed to save resume", error);
    return {
      submission,
      status: "error",
      message: "Could not save the resume. Please try again.",
      values,
    };
  }

  revalidatePath("/career/resumes");
  revalidatePath("/career");

  return { submission, status: "success" };
}

export async function deleteResume(resumeId: string): Promise<void> {
  const userId = await requireUserId();

  const resume = await db.resume.findFirst({ where: { id: resumeId, userId } });

  if (!resume) {
    return;
  }

  await deleteResumeFile(resume);
  await db.resume.delete({ where: { id: resume.id } });

  revalidatePath("/career/resumes");
  revalidatePath("/career");
}
