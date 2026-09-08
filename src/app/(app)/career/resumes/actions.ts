"use server";

import { revalidatePath } from "next/cache";

import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import { deleteResumeFile, saveResumeFile } from "@/lib/uploads";
import { MAX_FILE_SIZE_BYTES, RESUME_MIME_TYPES } from "@/lib/uploads-shared";
import { resumeTitleSchema } from "@/lib/validations/resume";

import type { ResumeFormState } from "./resume-form-state";

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

/** Records a resume whose bytes were already uploaded directly from the
 * browser to Vercel Blob (see UploadResumeForm + src/app/api/resumes/upload) —
 * used instead of {@link uploadResume} whenever Blob storage is configured,
 * since routing the file through this Server Action would hit Vercel's
 * ~4.5MB Function request-body cap well before the app's own 15MB limit. */
export async function finalizeResumeUpload(
  title: string,
  file: { fileName: string; storedName: string; storageUrl: string; mimeType: string; sizeBytes: number },
): Promise<{ status: "success" } | { status: "error"; message: string }> {
  const userId = await requireUserId();

  const parsed = resumeTitleSchema.safeParse(title);

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Invalid title." };
  }

  try {
    await db.resume.create({
      data: {
        userId,
        title: parsed.data,
        fileName: file.fileName,
        storedName: file.storedName,
        storageUrl: file.storageUrl,
        mimeType: file.mimeType,
        sizeBytes: file.sizeBytes,
      },
    });
  } catch (error) {
    console.error("Failed to save resume", error);
    return { status: "error", message: "Could not save the resume. Please try again." };
  }

  revalidatePath("/career/resumes");
  revalidatePath("/career");

  return { status: "success" };
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
