import { auth } from "@/auth";
import { getRecentNotifications } from "@/lib/notifications";

import { NotificationPopover } from "./notification-popover";

export async function NotificationBell() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const { notifications, unreadCount } = await getRecentNotifications(session.user.id);

  return <NotificationPopover notifications={notifications} unreadCount={unreadCount} />;
}
