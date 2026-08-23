"use server";

import { revalidatePath } from "next/cache";

import { requireUserId } from "./auth";
import { db } from "./db";

/**
 * A file-level "use server" module, separate from notifications.ts —
 * that file's top-level `db`/`pg` import chain isn't safe to pull into a
 * client bundle, and a file-level directive (rather than per-function
 * inline "use server") is what tells Next to strip the implementation and
 * hand the client a callable stub instead of trying to bundle it.
 */

export async function markNotificationRead(id: string): Promise<void> {
  const userId = await requireUserId();
  await db.notification.updateMany({
    where: { id, userId, readAt: null },
    data: { readAt: new Date() },
  });
  revalidatePath("/", "layout");
}

export async function markAllNotificationsRead(): Promise<void> {
  const userId = await requireUserId();
  await db.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });
  revalidatePath("/", "layout");
}
