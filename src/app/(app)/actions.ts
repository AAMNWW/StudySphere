"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import { noteSchema } from "@/lib/validations/note";

const taskTitleSchema = z.string().trim().min(1).max(150);

/** Quick-add — no error state on purpose, the `required`/`maxLength`
 * attributes on the input already keep this from being submitted empty;
 * a still-invalid submission (e.g. devtools tampering) just no-ops. */
export async function createTask(formData: FormData): Promise<void> {
  const userId = await requireUserId();
  const parsed = taskTitleSchema.safeParse(formData.get("title"));

  if (!parsed.success) {
    return;
  }

  await db.task.create({ data: { userId, title: parsed.data } });
  revalidatePath("/");
}

export async function setTaskCompleted(taskId: string, completed: boolean): Promise<void> {
  const userId = await requireUserId();

  await db.task.updateMany({ where: { id: taskId, userId }, data: { completed } });

  revalidatePath("/");
}

export async function deleteTask(taskId: string): Promise<void> {
  const userId = await requireUserId();

  await db.task.deleteMany({ where: { id: taskId, userId } });

  revalidatePath("/");
}

/** Dashboard quick-add for a note — just a title and which course it
 * belongs to; the body can be written later from the course's Notes page.
 * Same no-error-state approach as {@link createTask}. */
export async function createQuickNote(formData: FormData): Promise<void> {
  const userId = await requireUserId();
  const parsed = noteSchema.shape.title.safeParse(formData.get("title"));
  const courseId = String(formData.get("courseId") ?? "");

  if (!parsed.success || !courseId) {
    return;
  }

  // A course id owned by someone else behaves like one that doesn't exist.
  const course = await db.course.findFirst({
    where: { id: courseId, userId },
    select: { id: true },
  });

  if (!course) {
    return;
  }

  await db.note.create({ data: { courseId, title: parsed.data } });

  revalidatePath("/");
  revalidatePath(`/courses/${courseId}/notes`);
}
