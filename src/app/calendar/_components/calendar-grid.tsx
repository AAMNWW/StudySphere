import Link from "next/link";

import { dateKey, type CalendarDay } from "@/lib/calendar-grid";
import { cn } from "@/lib/utils";

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const MAX_VISIBLE_PER_DAY = 3;

export interface CalendarAssignmentItem {
  id: string;
  title: string;
  completed: boolean;
  isOverdue: boolean;
  courseId: string;
}

export function CalendarGrid({
  days,
  assignmentsByDay,
}: {
  days: CalendarDay[];
  assignmentsByDay: Map<string, CalendarAssignmentItem[]>;
}) {
  return (
    <div className="overflow-x-auto">
      <div className="grid min-w-[640px] grid-cols-7 gap-2">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="text-muted-foreground px-1 text-xs font-semibold tracking-wide uppercase"
          >
            {label}
          </div>
        ))}

        {days.map((day) => {
          const key = dateKey(day.date);
          const assignments = assignmentsByDay.get(key) ?? [];
          const visible = assignments.slice(0, MAX_VISIBLE_PER_DAY);
          const overflow = assignments.length - visible.length;

          return (
            <div
              key={key}
              className={cn(
                "min-h-24 space-y-1 rounded-xl border p-2",
                !day.inCurrentMonth && "bg-muted/30",
                day.isToday && "border-primary",
              )}
            >
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
                {visible.map((assignment) => (
                  <Link
                    key={assignment.id}
                    href={`/courses/${assignment.courseId}/assignments`}
                    title={assignment.title}
                    className={cn(
                      "block truncate rounded-md px-1.5 py-0.5 text-xs transition-colors",
                      assignment.completed
                        ? "text-muted-foreground bg-muted line-through"
                        : assignment.isOverdue
                          ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                          : "bg-muted text-foreground hover:bg-muted/70",
                    )}
                  >
                    {assignment.title}
                  </Link>
                ))}
                {overflow > 0 ? (
                  <p className="text-muted-foreground px-1.5 text-xs">+{overflow} more</p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
