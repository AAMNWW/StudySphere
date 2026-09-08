"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { draftResumeContent } from "@/lib/ai/resume-builder";
import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import { renderResumePdf } from "@/lib/pdf/resume-pdf";
import { saveResumeBytes } from "@/lib/uploads";
import { resumeDraftSchema, type ResumeDraft } from "@/lib/validations/resume-builder";
import { resumeTitleSchema } from "@/lib/validations/resume";

/**
 * AI-assist step of the builder: called directly from a client event
 * handler (not bound to a <form>), since the resulting draft populates a
 * complex client-managed form rather than replacing form state wholesale.
 */
export async function draftResume(background: string, targetRole: string): Promise<ResumeDraft> {
  await requireUserId();

  const trimmed = background.trim();

  if (!trimmed) {
    throw new Error("Paste some background first.");
  }

  return draftResumeContent(trimmed, targetRole.trim());
}

export type SaveResumeResult = { status: "error"; message: string } | { status: "success" };

/**
 * Renders the builder's current draft to a PDF and saves it as a real
 * Resume row — from then on it's indistinguishable from an uploaded one,
 * usable by ATS Check, Cover Letter, Job Tracker, etc.
 */
export async function saveGeneratedResume(
  title: string,
  draft: ResumeDraft,
): Promise<SaveResumeResult> {
  const userId = await requireUserId();

  const parsedTitle = resumeTitleSchema.safeParse(title);

  if (!parsedTitle.success) {
    return { status: "error", message: parsedTitle.error.issues[0].message };
  }

  const parsedDraft = resumeDraftSchema.safeParse(draft);

  if (!parsedDraft.success) {
    return { status: "error", message: "That resume is missing required details." };
  }

  try {
    const pdfBytes = await renderResumePdf(parsedDraft.data);
    const { storedName, storageUrl } = await saveResumeBytes(userId, pdfBytes);

    await db.resume.create({
      data: {
        userId,
        title: parsedTitle.data,
        fileName: `${parsedTitle.data}.pdf`,
        storedName,
        storageUrl,
        mimeType: "application/pdf",
        sizeBytes: pdfBytes.length,
      },
    });
  } catch (error) {
    console.error("Failed to save generated resume", error);
    return { status: "error", message: "Could not save the resume. Please try again." };
  }

  revalidatePath("/career/resumes");
  revalidatePath("/career");
  redirect("/career/resumes");
}
