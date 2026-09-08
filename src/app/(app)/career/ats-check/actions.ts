"use server";

import { checkAtsMatch } from "@/lib/ai/ats-check";
import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import { readResumeFile } from "@/lib/uploads";

import type { AtsCheckToolFormState } from "./ats-check-form-state";

/**
 * Ad-hoc ATS check, decoupled from the Job Tracker: unlike runAtsCheck in
 * career/jobs/actions.ts, the result isn't persisted anywhere — it's
 * returned straight in form state for the page to render, so this can be
 * re-run against any resume/job description pair without a JobApplication
 * row.
 */
export async function runStandaloneAtsCheck(
  previousState: AtsCheckToolFormState,
  formData: FormData,
): Promise<AtsCheckToolFormState> {
  const userId = await requireUserId();
  const submission = previousState.submission + 1;

  const values = {
    resumeId: String(formData.get("resumeId") ?? ""),
    jobDescription: String(formData.get("jobDescription") ?? "").trim(),
  };

  if (!values.resumeId) {
    return { submission, status: "error", message: "Choose a resume first.", values };
  }

  if (!values.jobDescription) {
    return { submission, status: "error", message: "Paste the job description first.", values };
  }

  const resume = await db.resume.findFirst({ where: { id: values.resumeId, userId } });

  if (!resume) {
    return { submission, status: "error", message: "That resume could not be found.", values };
  }

  try {
    const bytes = await readResumeFile(resume);
    const result = await checkAtsMatch(
      bytes,
      resume.mimeType,
      resume.fileName,
      values.jobDescription,
    );

    return { submission, status: "success", result, values };
  } catch (error) {
    console.error("Failed to run standalone ATS check", error);
    return {
      submission,
      status: "error",
      message: "Could not run the ATS check right now. Please try again.",
      values,
    };
  }
}
