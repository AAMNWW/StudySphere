"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/db";

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
