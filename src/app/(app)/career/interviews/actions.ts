"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { generateInterviewFeedback, startInterview } from "@/lib/ai/interview";
import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import { readResumeFile } from "@/lib/uploads";
import { interviewSessionSchema } from "@/lib/validations/interview";

import type { AiActionFormState, NewInterviewFormState } from "./interview-form-state";

export async function createInterviewSession(
  previousState: NewInterviewFormState,
  formData: FormData,
): Promise<NewInterviewFormState> {
  const userId = await requireUserId();
  const submission = previousState.submission + 1;

  const values = {
    role: String(formData.get("role") ?? ""),
    company: String(formData.get("company") ?? ""),
    resumeId: String(formData.get("resumeId") ?? ""),
  };

  const parsed = interviewSessionSchema.safeParse(values);

  if (!parsed.success) {
    return {
      submission,
      status: "error",
      errors: z.flattenError(parsed.error).fieldErrors,
      values,
    };
  }

  let resume: Awaited<ReturnType<typeof db.resume.findFirst>> = null;

  if (parsed.data.resumeId) {
    resume = await db.resume.findFirst({ where: { id: parsed.data.resumeId, userId } });

    if (!resume) {
      return {
        submission,
        status: "error",
        message: "That resume could not be found.",
        values,
      };
    }
  }

  let sessionId: string;

  try {
    const resumeSource = resume
      ? {
          bytes: await readResumeFile(resume),
          mimeType: resume.mimeType,
          fileName: resume.fileName,
        }
      : null;

    const opening = await startInterview(
      parsed.data.role,
      parsed.data.company || null,
      resumeSource,
    );

    const session = await db.interviewSession.create({
      data: {
        userId,
        role: parsed.data.role,
        company: parsed.data.company || null,
        resumeId: resume?.id ?? null,
        messages: { create: { role: "assistant", content: opening } },
      },
    });

    sessionId = session.id;
  } catch (error) {
    console.error("Failed to start mock interview", error);
    return {
      submission,
      status: "error",
      message: "Could not start the interview. Please try again.",
      values,
    };
  }

  revalidatePath("/career/interviews");
  redirect(`/career/interviews/${sessionId}`);
}

export async function endInterviewSession(
  sessionId: string,
  previousState: AiActionFormState,
): Promise<AiActionFormState> {
  const userId = await requireUserId();
  const submission = previousState.submission + 1;

  const session = await db.interviewSession.findFirst({
    where: { id: sessionId, userId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  if (!session) {
    return { submission, status: "error" };
  }

  if (session.status === "COMPLETED") {
    return { submission, status: "success" };
  }

  try {
    const transcript = session.messages.map((message) => ({
      role: message.role as "user" | "assistant",
      content: message.content,
    }));

    const feedback = await generateInterviewFeedback(
      session.role,
      session.company,
      transcript,
    );

    await db.interviewSession.update({
      where: { id: session.id },
      data: { status: "COMPLETED", feedback, feedbackError: null },
    });
  } catch (error) {
    console.error("Failed to generate interview feedback", error);
    await db.interviewSession.update({
      where: { id: session.id },
      data: {
        status: "COMPLETED",
        feedbackError: "Could not generate feedback right now. Please try again.",
      },
    });
    revalidatePath(`/career/interviews/${sessionId}`);
    return { submission, status: "error" };
  }

  revalidatePath(`/career/interviews/${sessionId}`);
  revalidatePath("/career/interviews");
  return { submission, status: "success" };
}

export async function retryInterviewFeedback(
  sessionId: string,
  previousState: AiActionFormState,
): Promise<AiActionFormState> {
  const userId = await requireUserId();
  const submission = previousState.submission + 1;

  const session = await db.interviewSession.findFirst({
    where: { id: sessionId, userId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  if (!session) {
    return { submission, status: "error" };
  }

  try {
    const transcript = session.messages.map((message) => ({
      role: message.role as "user" | "assistant",
      content: message.content,
    }));

    const feedback = await generateInterviewFeedback(
      session.role,
      session.company,
      transcript,
    );

    await db.interviewSession.update({
      where: { id: session.id },
      data: { feedback, feedbackError: null },
    });
  } catch (error) {
    console.error("Failed to generate interview feedback", error);
    await db.interviewSession.update({
      where: { id: session.id },
      data: { feedbackError: "Could not generate feedback right now. Please try again." },
    });
    revalidatePath(`/career/interviews/${sessionId}`);
    return { submission, status: "error" };
  }

  revalidatePath(`/career/interviews/${sessionId}`);
  return { submission, status: "success" };
}

export async function deleteInterviewSession(sessionId: string): Promise<void> {
  const userId = await requireUserId();

  await db.interviewSession.deleteMany({ where: { id: sessionId, userId } });

  revalidatePath("/career/interviews");
  redirect("/career/interviews");
}
