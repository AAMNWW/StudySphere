"use client";

import Link from "next/link";
import { useTransition } from "react";

import { setAssignmentCompleted } from "@/app/courses/[id]/actions";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

// Fixed locale and time zone so the server always renders the same string a
// user would see, regardless of where the server happens to run.
const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeZone: "UTC",
});

export function DashboardAssignmentRow({
  courseId,
  courseTitle,
  assignmentId,
  title,
  dueDate,
  isOverdue,
}: {
  courseId: string;
  courseTitle: string;
  assignmentId: string;
  title: string;
  dueDate: Date | null;
  isOverdue: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <li className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
      <Checkbox
        disabled={isPending}
        onCheckedChange={(completed) => {
          startTransition(() => {
            setAssignmentCompleted(courseId, assignmentId, completed);
          });
        }}
        aria-label={`Mark ${title} as done`}
        className="mt-1"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{title}</p>
        <p className="text-muted-foreground text-xs">
          <Link href={`/courses/${courseId}`} className="hover:underline">
            {courseTitle}
          </Link>
          {dueDate ? (
            <>
              {" · "}
              <span className={cn(isOverdue && "text-destructive")}>
                Due {dateFormatter.format(dueDate)}
                {isOverdue ? " (overdue)" : ""}
              </span>
            </>
          ) : null}
        </p>
      </div>
    </li>
  );
}
