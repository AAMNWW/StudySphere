"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import { jobApplicationSchema } from "@/lib/validations/job-application";

import type { JobApplicationFormState } from "./job-form-state";

function readValues(formData: FormData) {
  return {
    company: String(formData.get("company") ?? ""),
    role: String(formData.get("role") ?? ""),
    status: String(formData.get("status") ?? "SAVED"),
    jobUrl: String(formData.get("jobUrl") ?? ""),
    jobDescription: String(formData.get("jobDescription") ?? ""),
    notes: String(formData.get("notes") ?? ""),
    resumeId: String(formData.get("resumeId") ?? ""),
  };
}

/** appliedAt is set the first time a job's status moves off SAVED, and
 * never touched again — it marks when the student actually applied, not
 * when the row was last edited. */
function nextAppliedAt(status: string, currentAppliedAt: Date | null): Date | null {
  if (status === "SAVED") return currentAppliedAt;
  return currentAppliedAt ?? new Date();
}

export async function createJobApplication(
  previousState: JobApplicationFormState,
  formData: FormData,
): Promise<JobApplicationFormState> {
  const userId = await requireUserId();
  const submission = previousState.submission + 1;

  const values = readValues(formData);
  const parsed = jobApplicationSchema.safeParse(values);

  if (!parsed.success) {
    return {
      submission,
      status: "error",
      errors: z.flattenError(parsed.error).fieldErrors,
      values,
    };
  }

  let resumeId: string | null = null;
  if (parsed.data.resumeId) {
    const resume = await db.resume.findFirst({
      where: { id: parsed.data.resumeId, userId },
      select: { id: true },
    });
    resumeId = resume?.id ?? null;
  }

  try {
    await db.jobApplication.create({
      data: {
        userId,
        company: parsed.data.company,
        role: parsed.data.role,
        status: parsed.data.status,
        jobUrl: parsed.data.jobUrl || null,
        jobDescription: parsed.data.jobDescription || null,
        notes: parsed.data.notes || null,
        resumeId,
        appliedAt: nextAppliedAt(parsed.data.status, null),
      },
    });
  } catch (error) {
    console.error("Failed to create job application", error);
    return {
      submission,
      status: "error",
      message: "Could not save the job. Please try again.",
      values,
    };
  }

  revalidatePath("/career/jobs");
  revalidatePath("/career");

  return { submission, status: "success" };
}

export async function updateJobApplication(
  jobId: string,
  previousState: JobApplicationFormState,
  formData: FormData,
): Promise<JobApplicationFormState> {
  const userId = await requireUserId();
  const submission = previousState.submission + 1;

  const values = readValues(formData);
  const parsed = jobApplicationSchema.safeParse(values);

  if (!parsed.success) {
    return {
      submission,
      status: "error",
      errors: z.flattenError(parsed.error).fieldErrors,
      values,
    };
  }

  const existing = await db.jobApplication.findFirst({
    where: { id: jobId, userId },
    select: { appliedAt: true },
  });

  if (!existing) {
    return {
      submission,
      status: "error",
      message: "Could not save the job. Please try again.",
      values,
    };
  }

  let resumeId: string | null = null;
  if (parsed.data.resumeId) {
    const resume = await db.resume.findFirst({
      where: { id: parsed.data.resumeId, userId },
      select: { id: true },
    });
    resumeId = resume?.id ?? null;
  }

  try {
    await db.jobApplication.update({
      where: { id: jobId },
      data: {
        company: parsed.data.company,
        role: parsed.data.role,
        status: parsed.data.status,
        jobUrl: parsed.data.jobUrl || null,
        jobDescription: parsed.data.jobDescription || null,
        notes: parsed.data.notes || null,
        resumeId,
        appliedAt: nextAppliedAt(parsed.data.status, existing.appliedAt),
      },
    });
  } catch (error) {
    console.error("Failed to update job application", error);
    return {
      submission,
      status: "error",
      message: "Could not save the job. Please try again.",
      values,
    };
  }

  revalidatePath("/career/jobs");
  revalidatePath(`/career/jobs/${jobId}`);
  revalidatePath("/career");

  return { submission, status: "success", values };
}

/** Quick status change from the list view, without opening the full edit
 * form — same appliedAt auto-set logic as the full update. */
export async function setJobApplicationStatus(jobId: string, status: string): Promise<void> {
  const userId = await requireUserId();

  const parsedStatus = jobApplicationSchema.shape.status.safeParse(status);

  if (!parsedStatus.success) {
    return;
  }

  const existing = await db.jobApplication.findFirst({
    where: { id: jobId, userId },
    select: { appliedAt: true },
  });

  if (!existing) {
    return;
  }

  await db.jobApplication.update({
    where: { id: jobId },
    data: {
      status: parsedStatus.data,
      appliedAt: nextAppliedAt(parsedStatus.data, existing.appliedAt),
    },
  });

  revalidatePath("/career/jobs");
  revalidatePath(`/career/jobs/${jobId}`);
  revalidatePath("/career");
}

export async function deleteJobApplication(jobId: string): Promise<void> {
  const userId = await requireUserId();

  await db.jobApplication.deleteMany({ where: { id: jobId, userId } });

  revalidatePath("/career/jobs");
  revalidatePath("/career");
  redirect("/career/jobs");
}
