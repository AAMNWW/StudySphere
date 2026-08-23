"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import { careerChatThreadSchema } from "@/lib/validations/career-chat";

import type { NewCareerChatFormState } from "./career-chat-form-state";

export async function createCareerChatThread(
  previousState: NewCareerChatFormState,
  formData: FormData,
): Promise<NewCareerChatFormState> {
  const userId = await requireUserId();
  const submission = previousState.submission + 1;

  const values = { resumeId: String(formData.get("resumeId") ?? "") };
  const parsed = careerChatThreadSchema.safeParse(values);

  if (!parsed.success) {
    return { submission, status: "error", message: "Something went wrong.", values };
  }

  let resume: { id: string; title: string } | null = null;

  if (parsed.data.resumeId) {
    resume = await db.resume.findFirst({
      where: { id: parsed.data.resumeId, userId },
      select: { id: true, title: true },
    });

    if (!resume) {
      return {
        submission,
        status: "error",
        message: "That resume could not be found.",
        values,
      };
    }
  }

  const thread = await db.careerChatThread.create({
    data: {
      userId,
      resumeId: resume?.id ?? null,
      title: resume ? `Resume Chat — ${resume.title}` : "Career Coach",
    },
  });

  revalidatePath("/career/chat");
  redirect(`/career/chat/${thread.id}`);
}

export async function deleteCareerChatThread(threadId: string): Promise<void> {
  const userId = await requireUserId();

  await db.careerChatThread.deleteMany({ where: { id: threadId, userId } });

  revalidatePath("/career/chat");
}
