"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { NotificationModel } from "@/generated/prisma/models";
import { markAllNotificationsRead, markNotificationRead } from "@/lib/notifications-actions";
import { cn } from "@/lib/utils";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

/**
 * Read-state is tracked in local state, seeded from the server-fetched
 * props, so clicking a notification (or "Mark all read") updates the badge
 * and row styling instantly instead of waiting on the next full navigation
 * to re-run NotificationBell's server-side fetch.
 */
export function NotificationPopover({
  notifications,
  unreadCount,
}: {
  notifications: NotificationModel[];
  unreadCount: number;
}) {
  const [readIds, setReadIds] = useState<Set<string>>(
    () => new Set(notifications.filter((n) => n.readAt !== null).map((n) => n.id)),
  );
  // Set once "Mark all read" is clicked — the server action marks every
  // unread row for this user, including any beyond the visible list, so the
  // badge should drop straight to zero rather than being derived per-row.
  const [allRead, setAllRead] = useState(false);
  const [, startTransition] = useTransition();

  function markOneRead(id: string) {
    setReadIds((current) => new Set(current).add(id));
    startTransition(() => {
      markNotificationRead(id);
    });
  }

  function markAllRead() {
    setReadIds(new Set(notifications.map((n) => n.id)));
    setAllRead(true);
    startTransition(() => {
      markAllNotificationsRead();
    });
  }

  // How many of the *visible* notifications were unread on load but have
  // since been marked read this session — subtracted from the server's
  // total unread count for an instant badge update.
  const newlyReadCount = notifications.filter(
    (n) => n.readAt === null && readIds.has(n.id),
  ).length;
  const badgeCount = allRead ? 0 : Math.max(0, unreadCount - newlyReadCount);

  return (
    <Popover>
      <PopoverTrigger
        aria-label="Notifications"
        className="hover:bg-muted relative flex size-8 items-center justify-center rounded-full transition-colors"
      >
        <Bell className="size-4" />
        {badgeCount > 0 ? (
          <span className="bg-destructive text-destructive-foreground absolute top-0.5 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-medium">
            {badgeCount > 9 ? "9+" : badgeCount}
          </span>
        ) : null}
      </PopoverTrigger>

      <PopoverContent>
        <div className="flex items-center justify-between px-2 py-1.5">
          <p className="text-sm font-semibold">Notifications</p>
          {badgeCount > 0 ? (
            <button
              type="button"
              onClick={markAllRead}
              className="text-muted-foreground hover:text-foreground text-xs"
            >
              Mark all read
            </button>
          ) : null}
        </div>

        {notifications.length === 0 ? (
          <p className="text-muted-foreground px-2 py-6 text-center text-sm">
            No notifications yet.
          </p>
        ) : (
          <ul className="max-h-80 space-y-0.5 overflow-y-auto">
            {notifications.map((notification) => {
              const isRead = notification.readAt !== null || readIds.has(notification.id);

              return (
                <li key={notification.id}>
                  <Link
                    href={notification.link}
                    onClick={() => markOneRead(notification.id)}
                    className={cn(
                      "hover:bg-muted flex items-start gap-2 rounded-xl px-2 py-2 text-sm transition-colors",
                      !isRead && "bg-muted/50",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-1.5 size-1.5 shrink-0 rounded-full",
                        isRead ? "bg-transparent" : "bg-primary",
                      )}
                    />
                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          "block truncate",
                          !isRead ? "font-medium" : "text-muted-foreground",
                        )}
                      >
                        {notification.title}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {dateFormatter.format(notification.createdAt)}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}
