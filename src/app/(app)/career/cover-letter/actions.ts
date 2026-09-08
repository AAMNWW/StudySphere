"use server";

import { generateCoverLetter } from "@/lib/ai/cover-letter";
import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import { readResumeFile } from "@/lib/uploads";

import type { CoverLetterToolFormState } from "./cover-letter-form-state";

/**
 * Ad-hoc cover letter draft, decoupled from the Job Tracker: the result
 * isn't persisted, it's just returned in form state — mirrors
 * career/ats-check/actions.ts.
 */
export async function generateStandaloneCoverLetter(
  previousState: CoverLetterToolFormState,
  formData: FormData,
): Promise<CoverLetterToolFormState> {
  const userId = await requireUserId();
  const submission = previousState.submission + 1;

  const values = {
    resumeId: String(formData.get("resumeId") ?? ""),
    company: String(formData.get("company") ?? "").trim(),
    role: String(formData.get("role") ?? "").trim(),
    jobDescription: String(formData.get("jobDescription") ?? "").trim(),
  };

  if (!values.resumeId) {
    return { submission, status: "error", message: "Choose a resume first.", values };
  }

  if (!values.company || !values.role) {
    return {
      submission,
      status: "error",
      message: "Enter the company and role you're applying for.",
      values,
    };
  }

  const resume = await db.resume.findFirst({ where: { id: values.resumeId, userId } });

  if (!resume) {
    return { submission, status: "error", message: "That resume could not be found.", values };
  }

  try {
    const bytes = await readResumeFile(resume);
    const coverLetter = await generateCoverLetter(
      bytes,
      resume.mimeType,
      resume.fileName,
      values.company,
      values.role,
      values.jobDescription || null,
    );

    return { submission, status: "success", coverLetter, values };
  } catch (error) {
    console.error("Failed to generate standalone cover letter", error);
    return {
      submission,
      status: "error",
      message: "Could not generate a cover letter right now. Please try again.",
      values,
    };
  }
}
