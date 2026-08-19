import { db } from "@/lib/db";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

function utcDateOnly(date: Date): number {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

export interface StreakInfo {
  current: number;
  longest: number;
}

/**
 * Call once per dashboard load. Increments the streak if the last visit was
 * exactly yesterday (UTC calendar day), resets it to 1 on a gap, and leaves
 * it untouched if today's visit was already recorded.
 */
export async function recordDashboardVisit(userId: string): Promise<StreakInfo> {
  const user = await db.user.findUniqueOrThrow({
    where: { id: userId },
    select: { currentStreak: true, longestStreak: true, lastVisitAt: true },
  });

  const today = utcDateOnly(new Date());
  const lastVisit = user.lastVisitAt ? utcDateOnly(user.lastVisitAt) : null;

  if (lastVisit === today) {
    return { current: user.currentStreak, longest: user.longestStreak };
  }

  const isConsecutive = lastVisit !== null && today - lastVisit === ONE_DAY_MS;
  const current = isConsecutive ? user.currentStreak + 1 : 1;
  const longest = Math.max(user.longestStreak, current);

  await db.user.update({
    where: { id: userId },
    data: { currentStreak: current, longestStreak: longest, lastVisitAt: new Date() },
  });

  return { current, longest };
}
