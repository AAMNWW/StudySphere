"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export async function deleteUser(userId: string): Promise<void> {
  const adminId = await requireAdmin();

  // Deleting yourself here would lock you out of the panel that could
  // undo it — refuse silently rather than let the confirm() dialog be the
  // only thing standing between an admin and their own account.
  if (userId === adminId) {
    return;
  }

  // onDelete: Cascade on every User relation (Course, and everything a
  // Course cascades to in turn) means this one call removes all of that
  // student's data — the same mechanism DeleteCourseButton already relies
  // on for a single course.
  await db.user.delete({ where: { id: userId } });

  revalidatePath("/admin");
}
