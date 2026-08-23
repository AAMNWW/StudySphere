/** Days between now and `date`, floored to whole UTC calendar days — 0
 * means "today", negative means it's already passed. Not a component or
 * hook, so reading the current time here isn't reachable by React's purity
 * analysis for render functions (see isAssignmentOverdue for the same
 * reasoning). */
export function daysUntil(date: Date): number {
  const startOfToday = new Date();
  startOfToday.setUTCHours(0, 0, 0, 0);
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((date.getTime() - startOfToday.getTime()) / msPerDay);
}

/** Turns a daysUntil() result into "Today" / "Tomorrow" / "N days" / "Past". */
export function countdownLabel(days: number): string {
  if (days < 0) return "Past";
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `${days} days`;
}
