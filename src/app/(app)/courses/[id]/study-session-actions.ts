"use server";

import { revalidatePath } from "next/cache";

import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * Starts a timed study session for this course. Ends any other session
 * still running for this user first — at most one can be active at a time,
 * enforced here rather than with a DB constraint (see the StudySession
 * model's doc comment in prisma/schema.prisma).
 */
export async function startStudySession(
  courseId: string,
): Promise<{ id: string; startedAt: string }> {
  const userId = await requireUserId();

  await db.studySession.updateMany({
    where: { userId, endedAt: null },
    data: { endedAt: new Date() },
  });

  const session = await db.studySession.create({
    data: { userId, courseId },
    select: { id: true, startedAt: true },
  });

  revalidatePath(`/courses/${courseId}`);

  return { id: session.id, startedAt: session.startedAt.toISOString() };
}

export async function endStudySession(courseId: string, sessionId: string): Promise<void> {
  const userId = await requireUserId();

  await db.studySession.updateMany({
    where: { id: sessionId, userId, endedAt: null },
    data: { endedAt: new Date() },
  });

  revalidatePath(`/courses/${courseId}`);
  revalidatePath(`/courses/${courseId}/analytics`);
}
