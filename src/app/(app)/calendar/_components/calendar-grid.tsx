"use client";

import { CalendarDays, CheckSquare, GraduationCap, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { RevealGroup, RevealItem } from "@/app/(app)/_components/reveal";
import { PriorityDot } from "@/components/priority-badge";
import type { AssignmentPriority } from "@/generated/prisma/enums";
import { dateKey, type CalendarDay } from "@/lib/calendar-grid";
import { cn } from "@/lib/utils";

import { AddToDayDialog } from "./add-to-day-dialog";

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const MAX_VISIBLE_PER_DAY = 3;

export interface CalendarAssignmentItem {
  id: string;
  title: string;
  completed: boolean;
  priority: AssignmentPriority;
  isOverdue: boolean;
  courseId: string;
}

export interface CalendarExamItem {
  id: string;
  title: string;
  courseId: string;
}

/** A task given a date (added from a calendar day — see AddToDayDialog). */
export interface CalendarTaskItem {
  id: string;
  title: string;
  completed: boolean;
}

const dayLabelFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});

/** An event pulled live from the student's connected Google Calendar (see
 * src/lib/google-calendar.ts) — read-only display, never written back. */
export interface CalendarExternalItem {
  id: string;
  title: string;
  url?: string;
}

export function CalendarGrid({
  days,
  assignmentsByDay,
  examsByDay,
  tasksByDay,
  externalEventsByDay,
  courses,
}: {
  days: CalendarDay[];
  assignmentsByDay: Map<string, CalendarAssignmentItem[]>;
  examsByDay: Map<string, CalendarExamItem[]>;
  tasksByDay: Map<string, CalendarTaskItem[]>;
  externalEventsByDay?: Map<string, CalendarExternalItem[]>;
  courses: { id: string; title: string }[];
}) {
  // The YYYY-MM-DD day being added to, or null when the dialog is closed.
  const [addingTo, setAddingTo] = useState<string | null>(null);

  return (
    <div className="overflow-x-auto">
      <AddToDayDialog date={addingTo} courses={courses} onClose={() => setAddingTo(null)} />
      {/* All 7 days fit on a phone: tighter cells, and entries show as just
          their icon/dot below `sm` (tap for details; the title is on hover). */}
      <RevealGroup className="grid grid-cols-7 gap-1 sm:min-w-[640px] sm:gap-2" stagger={0.012}>
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="text-muted-foreground px-0.5 text-[0.65rem] font-semibold tracking-wide uppercase sm:px-1 sm:text-xs"
          >
            {label}
          </div>
        ))}

        {days.map((day) => {
          const key = dateKey(day.date);
          const exams = examsByDay.get(key) ?? [];
          const assignments = assignmentsByDay.get(key) ?? [];
          const externalEvents = externalEventsByDay?.get(key) ?? [];
          const tasks = tasksByDay.get(key) ?? [];
          const visible = assignments.slice(0, MAX_VISIBLE_PER_DAY);
          const overflow = assignments.length - visible.length;

          return (
            <RevealItem
              key={key}
              className={cn(
                // Clicking anywhere on the day (outside its entries, which
                // stop propagation) opens "add to this day"; the + button is
                // the keyboard-reachable way in.
                "group/day hover:border-primary/40 relative min-h-16 min-w-0 cursor-pointer space-y-1 rounded-lg border p-1 transition-[transform,border-color] duration-200 sm:min-h-24 sm:rounded-xl sm:p-2",
                (assignments.length > 0 || exams.length > 0 || tasks.length > 0 || externalEvents.length > 0) &&
                  "hover:-translate-y-0.5 hover:shadow-sm",
                !day.inCurrentMonth && "bg-muted/30",
                day.isToday && "border-primary",
              )}
              onClick={() => setAddingTo(key)}
            >
              <button
                type="button"
                aria-label={`Add to ${dayLabelFormatter.format(day.date)}`}
                onClick={(event) => {
                  event.stopPropagation();
                  setAddingTo(key);
                }}
                className="text-muted-foreground hover:bg-primary hover:text-primary-foreground focus-visible:ring-ring/50 absolute top-1 right-1 hidden size-5 cursor-pointer items-center justify-center rounded-md opacity-0 transition-opacity group-hover/day:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 sm:flex"
              >
                <Plus className="size-3.5" />
              </button>
              <p
                className={cn(
                  "text-xs font-medium",
                  !day.inCurrentMonth && "text-muted-foreground/60",
                  day.isToday &&
                    "bg-primary text-primary-foreground -mt-0.5 -ml-0.5 inline-flex size-5 items-center justify-center rounded-full",
                )}
              >
                {day.date.getUTCDate()}
              </p>

              <div className="space-y-1">
                {exams.map((exam) => (
                  <Link
                    key={exam.id}
                    onClick={(event) => event.stopPropagation()}
                    href={`/courses/${exam.courseId}/exams`}
                    title={exam.title}
                    className="flex items-center justify-center gap-1 truncate rounded-md bg-red-100 px-1 py-0.5 text-xs text-red-700 transition-colors hover:bg-red-200 sm:justify-start sm:px-1.5"
                  >
                    <GraduationCap className="size-3 shrink-0" />
                    <span className="hidden truncate sm:inline">{exam.title}</span>
                  </Link>
                ))}
                {visible.map((assignment) => (
                  <Link
                    key={assignment.id}
                    onClick={(event) => event.stopPropagation()}
                    href={`/courses/${assignment.courseId}/assignments`}
                    title={assignment.title}
                    className={cn(
                      "flex items-center justify-center gap-1 truncate rounded-md px-1 py-0.5 text-xs transition-colors sm:justify-start sm:px-1.5",
                      assignment.completed
                        ? "text-muted-foreground bg-muted line-through"
                        : assignment.isOverdue
                          ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                          : "bg-muted text-foreground hover:bg-muted/70",
                    )}
                  >
                    <PriorityDot priority={assignment.priority} />
                    <span className="hidden truncate sm:inline">{assignment.title}</span>
                  </Link>
                ))}
                {overflow > 0 ? (
                  <p className="text-muted-foreground px-0.5 text-[0.65rem] sm:px-1.5 sm:text-xs">+{overflow}<span className="hidden sm:inline"> more</span></p>
                ) : null}
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    title={task.title}
                    className={cn(
                      "flex items-center justify-center gap-1 truncate rounded-md bg-emerald-100 px-1 py-0.5 text-xs text-emerald-800 sm:justify-start sm:px-1.5",
                      task.completed && "line-through opacity-60",
                    )}
                  >
                    <CheckSquare className="size-3 shrink-0" />
                    <span className="hidden truncate sm:inline">{task.title}</span>
                  </div>
                ))}
                {externalEvents.map((event) => {
                  const content = (
                    <>
                      <CalendarDays className="size-3 shrink-0" />
                      <span className="hidden truncate sm:inline">{event.title}</span>
                    </>
                  );
                  const className =
                    "flex items-center justify-center gap-1 truncate rounded-md bg-blue-100 px-1 py-0.5 text-xs text-blue-700 transition-colors hover:bg-blue-200 sm:justify-start sm:px-1.5";

                  return event.url ? (
                    <a
                      key={event.id}
                      onClick={(clickEvent) => clickEvent.stopPropagation()}
                      href={event.url}
                      target="_blank"
                      rel="noreferrer"
                      title={event.title}
                      className={className}
                    >
                      {content}
                    </a>
                  ) : (
                    <div key={event.id} title={event.title} className={className}>
                      {content}
                    </div>
                  );
                })}
              </div>
            </RevealItem>
          );
        })}
      </RevealGroup>
    </div>
  );
}
