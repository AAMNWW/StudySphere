export interface CalendarDay {
  /** UTC midnight for this day. */
  date: Date;
  inCurrentMonth: boolean;
  isToday: boolean;
}

function isSameUTCDate(a: Date, b: Date): boolean {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

/** `YYYY-MM-DD` in UTC — used to group items by day regardless of time-of-day. */
export function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * A fixed 42-cell (6-week) month grid, starting on Monday, including the
 * leading/trailing days from adjacent months so the grid is never ragged.
 * `month` is 0-indexed (0 = January), matching `Date`'s own convention.
 */
export function getMonthGrid(year: number, month: number, today: Date): CalendarDay[] {
  const firstOfMonth = new Date(Date.UTC(year, month, 1));
  // getUTCDay() is 0 (Sun) .. 6 (Sat); shift so Monday is 0.
  const firstWeekday = (firstOfMonth.getUTCDay() + 6) % 7;

  const gridStart = new Date(firstOfMonth);
  gridStart.setUTCDate(firstOfMonth.getUTCDate() - firstWeekday);

  return Array.from({ length: 42 }, (_, i) => {
    const date = new Date(gridStart);
    date.setUTCDate(gridStart.getUTCDate() + i);

    return {
      date,
      inCurrentMonth: date.getUTCMonth() === month,
      isToday: isSameUTCDate(date, today),
    };
  });
}
