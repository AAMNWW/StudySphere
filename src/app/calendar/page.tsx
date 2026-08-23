import { Calendar as CalendarIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { auth } from "@/auth";
import { AppSidebar } from "@/components/app-sidebar";
import { IconTile } from "@/components/icon-tile";
import { requireUserId } from "@/lib/auth";
import { dateKey, getMonthGrid } from "@/lib/calendar-grid";
import { db } from "@/lib/db";
import { isAssignmentOverdue } from "@/lib/is-assignment-overdue";

import { CalendarGrid, type CalendarAssignmentItem } from "./_components/calendar-grid";

export const metadata: Metadata = {
  title: "Calendar",
};

const monthLabelFormatter = new Intl.DateTimeFormat("en-GB", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

function monthParam(year: number, month: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}`;
}

/** Parses a `?month=YYYY-MM` value, falling back to the given default on
 * anything malformed rather than erroring the page. */
function parseMonthParam(
  value: string | undefined,
  fallback: { year: number; month: number },
): { year: number; month: number } {
  const match = value?.match(/^(\d{4})-(\d{2})$/);

  if (!match) {
    return fallback;
  }

  const year = Number(match[1]);
  const month = Number(match[2]) - 1;

  if (month < 0 || month > 11) {
    return fallback;
  }

  return { year, month };
}

export default async function CalendarPage({
  searchParams,
}: PageProps<"/calendar">) {
  const userId = await requireUserId();
  const session = await auth();
  const { month: monthQuery } = await searchParams;

  const today = new Date();
  const current = { year: today.getUTCFullYear(), month: today.getUTCMonth() };
  const { year, month } = parseMonthParam(
    typeof monthQuery === "string" ? monthQuery : undefined,
    current,
  );

  const days = getMonthGrid(year, month, today);
  const gridStart = days[0].date;
  const gridEnd = new Date(days[days.length - 1].date);
  gridEnd.setUTCDate(gridEnd.getUTCDate() + 1);

  const assignments = await db.assignment.findMany({
    where: { course: { userId }, dueDate: { gte: gridStart, lt: gridEnd } },
    include: { course: { select: { id: true, title: true } } },
    orderBy: { dueDate: "asc" },
  });

  const assignmentsByDay = new Map<string, CalendarAssignmentItem[]>();
  for (const assignment of assignments) {
    const key = dateKey(assignment.dueDate!);
    const item: CalendarAssignmentItem = {
      id: assignment.id,
      title: assignment.title,
      completed: assignment.completed,
      isOverdue: isAssignmentOverdue(assignment),
      courseId: assignment.course.id,
    };
    assignmentsByDay.set(key, [...(assignmentsByDay.get(key) ?? []), item]);
  }

  const isCurrentMonth = year === current.year && month === current.month;
  const prevMonth = month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 };
  const nextMonth = month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 md:flex-row md:gap-8">
      <AppSidebar isAdmin={session?.user?.role === "ADMIN"} />
      <main className="min-w-0 flex-1">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <IconTile color="green">
              <CalendarIcon className="size-5" />
            </IconTile>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {monthLabelFormatter.format(new Date(Date.UTC(year, month, 1)))}
              </h1>
              <p className="text-muted-foreground text-sm">Assignments due across every course.</p>
            </div>
          </div>

          <div className="flex gap-2 text-sm">
            <Link
              href={`/calendar?month=${monthParam(prevMonth.year, prevMonth.month)}`}
              className="hover:bg-muted rounded-full border px-3 py-1"
            >
              ← Prev
            </Link>
            {!isCurrentMonth ? (
              <Link href="/calendar" className="hover:bg-muted rounded-full border px-3 py-1">
                Today
              </Link>
            ) : null}
            <Link
              href={`/calendar?month=${monthParam(nextMonth.year, nextMonth.month)}`}
              className="hover:bg-muted rounded-full border px-3 py-1"
            >
              Next →
            </Link>
          </div>
        </header>

        <CalendarGrid days={days} assignmentsByDay={assignmentsByDay} />
      </main>
    </div>
  );
}
