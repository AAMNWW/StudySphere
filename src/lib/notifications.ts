import type { NotificationModel } from "@/generated/prisma/models";
import type { NotificationType } from "@/generated/prisma/enums";

import { db } from "./db";

const RECENT_LIMIT = 20;

export interface RecentNotifications {
  notifications: NotificationModel[];
  unreadCount: number;
}

/** Latest notifications for the bell popover, plus a separate unread count
 * (unread rows may fall outside the `RECENT_LIMIT` window). Server-only —
 * never imported by a Client Component (see notifications-actions.ts for
 * the mark-read mutations client code calls). */
export async function getRecentNotifications(userId: string): Promise<RecentNotifications> {
  const [notifications, unreadCount] = await Promise.all([
    db.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: RECENT_LIMIT,
    }),
    db.notification.count({ where: { userId, readAt: null } }),
  ]);

  return { notifications, unreadCount };
}

/** Internal helper for trigger points (the deadline-reminder cron, the
 * study-planner action) — not a Server Action, just a plain db write. */
export async function createNotification(input: {
  userId: string;
  type: NotificationType;
  title: string;
  link: string;
}): Promise<void> {
  await db.notification.create({ data: input });
}
