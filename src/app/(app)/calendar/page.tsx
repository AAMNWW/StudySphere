import { Calendar as CalendarIcon, CalendarDays } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { auth } from "@/auth";
import { AppSidebar } from "@/components/app-sidebar";
import { IconTile } from "@/components/icon-tile";
import { requireUserId } from "@/lib/auth";
import { dateKey, getMonthGrid } from "@/lib/calendar-grid";
import { db } from "@/lib/db";
import { getConnectedCalendarClient } from "@/lib/google-calendar";
import { isGoogleOAuthConfigured } from "@/lib/google-oauth";
import { isAssignmentOverdue } from "@/lib/is-assignment-overdue";

import { Reveal } from "../_components/reveal";
import {
  CalendarGrid,
  type CalendarAssignmentItem,
  type CalendarExamItem,
  type CalendarExternalItem,
} from "./_components/calendar-grid";

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

  const [assignments, exams] = await Promise.all([
    db.assignment.findMany({
      where: { course: { userId }, dueDate: { gte: gridStart, lt: gridEnd } },
      include: { course: { select: { id: true, title: true } } },
      orderBy: { dueDate: "asc" },
    }),
    db.exam.findMany({
      where: { userId, examDate: { gte: gridStart, lt: gridEnd } },
      include: { course: { select: { id: true, title: true } } },
      orderBy: { examDate: "asc" },
    }),
  ]);

  const assignmentsByDay = new Map<string, CalendarAssignmentItem[]>();
  for (const assignment of assignments) {
    const key = dateKey(assignment.dueDate!);
    const item: CalendarAssignmentItem = {
      id: assignment.id,
      title: assignment.title,
      completed: assignment.completed,
      priority: assignment.priority,
      isOverdue: isAssignmentOverdue(assignment),
      courseId: assignment.course.id,
    };
    assignmentsByDay.set(key, [...(assignmentsByDay.get(key) ?? []), item]);
  }

  const examsByDay = new Map<string, CalendarExamItem[]>();
  for (const exam of exams) {
    const key = dateKey(exam.examDate);
    const item: CalendarExamItem = {
      id: exam.id,
      title: exam.title,
      courseId: exam.course.id,
    };
    examsByDay.set(key, [...(examsByDay.get(key) ?? []), item]);
  }

  const externalEventsByDay = new Map<string, CalendarExternalItem[]>();
  const calendarClient = await getConnectedCalendarClient(userId);
  // "unavailable" = connected, but this month's events couldn't be fetched —
  // shown in the header so an empty grid isn't mistaken for an empty Google
  // Calendar.
  let googleStatus: "connected" | "unavailable" | "disconnected" = calendarClient
    ? "connected"
    : "disconnected";

  if (calendarClient) {
    // Events this app exported itself (see src/lib/google-calendar.ts) are
    // already shown above as assignments/exams — excluded here so they
    // don't render twice.
    const ownEventIds = new Set(
      (
        await db.calendarSyncLink.findMany({ where: { userId }, select: { googleEventId: true } })
      ).map((link) => link.googleEventId),
    );

    try {
      const { data } = await calendarClient.events.list({
        calendarId: "primary",
        timeMin: gridStart.toISOString(),
        timeMax: gridEnd.toISOString(),
        singleEvents: true,
        orderBy: "startTime",
      });

      for (const event of data.items ?? []) {
        if (!event.id || ownEventIds.has(event.id)) {
          continue;
        }
        const key = event.start?.date ?? event.start?.dateTime?.slice(0, 10);
        if (!key || !event.summary) {
          continue;
        }
        const item: CalendarExternalItem = {
          id: event.id,
          title: event.summary,
          url: event.htmlLink ?? undefined,
        };
        externalEventsByDay.set(key, [...(externalEventsByDay.get(key) ?? []), item]);
      }
    } catch (error) {
      console.error("Failed to fetch Google Calendar events", error);
      googleStatus = "unavailable";
    }
  }

  const isCurrentMonth = year === current.year && month === current.month;
  const prevMonth = month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 };
  const nextMonth = month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 md:flex-row md:gap-8">
      <AppSidebar isAdmin={session?.user?.role === "ADMIN"} />
      <main className="min-w-0 flex-1">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Reveal key={monthParam(year, month)} className="flex items-center gap-3">
            <IconTile color="green">
              <CalendarIcon className="size-5" />
            </IconTile>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {monthLabelFormatter.format(new Date(Date.UTC(year, month, 1)))}
              </h1>
              <p className="text-muted-foreground text-sm">
                Assignments and exams across every course{googleStatus === "connected" ? ", plus your Google events" : ""}.
              </p>
            </div>
          </Reveal>

          <div className="flex flex-wrap items-center gap-2 text-sm">
            {googleStatus === "connected" ? (
              <Link
                href="/settings"
                className="flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-blue-700 hover:bg-blue-200"
              >
                <CalendarDays className="size-3.5" />
                Synced with Google
              </Link>
            ) : googleStatus === "unavailable" ? (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-800">
                Couldn&apos;t load Google events
              </span>
            ) : isGoogleOAuthConfigured() ? (
              // Plain <a>, not <Link>: this route handler redirects off-site
              // to Google's consent screen.
              <a
                href="/api/integrations/google-calendar/connect"
                className="hover:bg-muted flex items-center gap-1.5 rounded-full border px-3 py-1"
              >
                <CalendarDays className="size-3.5" />
                Connect Google Calendar
              </a>
            ) : null}
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

        <CalendarGrid
          key={monthParam(year, month)}
          days={days}
          assignmentsByDay={assignmentsByDay}
          examsByDay={examsByDay}
          externalEventsByDay={externalEventsByDay}
        />
      </main>
    </div>
  );
}
