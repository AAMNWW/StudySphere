"use client";

import { Dialog } from "@base-ui/react/dialog";
import { CheckSquare, Clock, GraduationCap, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { createAssignment, createExam } from "@/app/(app)/courses/[id]/actions";
import { initialAssignmentFormState } from "@/app/(app)/courses/[id]/assignment-form-state";
import { initialExamFormState } from "@/app/(app)/courses/[id]/exam-form-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import { createCalendarTask } from "../../actions";

type Kind = "deadline" | "exam" | "task";

const KINDS: { value: Kind; label: string; icon: typeof Clock }[] = [
  { value: "deadline", label: "Deadline", icon: Clock },
  { value: "exam", label: "Exam", icon: GraduationCap },
  { value: "task", label: "Task", icon: CheckSquare },
];

const dayFormatter = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});

const SELECT_CLASS =
  "border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 h-8 w-full rounded-lg border bg-transparent px-2 text-sm outline-none focus-visible:ring-3";

/**
 * "Add something on this date" from the calendar. Reuses the same Server
 * Actions as the course pages (createAssignment / createExam), so validation,
 * Google Calendar sync and reminders all behave exactly as they do there;
 * tasks go through createCalendarTask. `date` is a YYYY-MM-DD key, or null
 * while closed.
 */
export function AddToDayDialog({
  date,
  courses,
  onClose,
}: {
  date: string | null;
  courses: { id: string; title: string }[];
  onClose: () => void;
}) {
  const router = useRouter();
  const [kind, setKind] = useState<Kind>("deadline");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const needsCourse = kind !== "task";

  function submit(formData: FormData) {
    if (!date) return;
    setError(null);

    startTransition(async () => {
      let failure: string | null = null;
      const courseId = String(formData.get("courseId") ?? "");

      if (kind === "task") {
        formData.set("date", date);
        const result = await createCalendarTask(formData);
        if (result.status === "error") failure = result.message;
      } else if (kind === "deadline") {
        formData.set("dueDate", date);
        const result = await createAssignment(courseId, initialAssignmentFormState, formData);
        if (result.status === "error") {
          failure = result.message ?? Object.values(result.errors ?? {}).flat()[0] ?? "Could not save.";
        }
      } else {
        formData.set("examDate", date);
        const result = await createExam(courseId, initialExamFormState, formData);
        if (result.status === "error") {
          failure = result.message ?? Object.values(result.errors ?? {}).flat()[0] ?? "Could not save.";
        }
      }

      if (failure) {
        setError(failure);
        return;
      }

      onClose();
      router.refresh();
    });
  }

  return (
    <Dialog.Root
      open={date !== null}
      onOpenChange={(open) => {
        if (!open) {
          setError(null);
          onClose();
        }
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/30 transition-opacity duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <Dialog.Popup className="bg-popover text-popover-foreground fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border p-5 shadow-xl transition-[opacity,scale] duration-150 outline-none data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="font-heading text-lg font-semibold">Add to your calendar</Dialog.Title>
              <Dialog.Description className="text-muted-foreground text-sm">
                {date ? dayFormatter.format(new Date(`${date}T00:00:00Z`)) : null}
              </Dialog.Description>
            </div>
            <Dialog.Close
              aria-label="Close"
              className="hover:bg-muted -mt-1 -mr-1 flex size-8 cursor-pointer items-center justify-center rounded-md"
            >
              <X className="size-4" />
            </Dialog.Close>
          </div>

          <div role="tablist" aria-label="What to add" className="bg-muted mb-4 grid grid-cols-3 gap-1 rounded-lg p-1">
            {KINDS.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={kind === value}
                onClick={() => {
                  setKind(value);
                  setError(null);
                }}
                className={cn(
                  "flex cursor-pointer items-center justify-center gap-1.5 rounded-md py-1.5 text-sm font-medium transition-colors",
                  kind === value ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="size-3.5" />
                {label}
              </button>
            ))}
          </div>

          {needsCourse && courses.length === 0 ? (
            <p className="text-muted-foreground rounded-lg border border-dashed p-4 text-center text-sm">
              {kind === "deadline" ? "Deadlines" : "Exams"} belong to a course.{" "}
              <Link href="/courses" className="text-foreground underline underline-offset-4">
                Add a course
              </Link>{" "}
              first, or add a task instead.
            </p>
          ) : (
            <form key={kind} action={submit} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="day-title">Title</Label>
                <Input
                  id="day-title"
                  name="title"
                  required
                  maxLength={kind === "task" ? 150 : 100}
                  autoFocus
                  placeholder={
                    kind === "deadline" ? "Problem set 4" : kind === "exam" ? "Midterm" : "Revise chapter 3"
                  }
                />
              </div>

              {courses.length > 0 ? (
                <div className="space-y-1.5">
                  <Label htmlFor="day-course">{needsCourse ? "Course" : "Course (optional)"}</Label>
                  <select
                    id="day-course"
                    name="courseId"
                    defaultValue={needsCourse ? courses[0].id : ""}
                    className={SELECT_CLASS}
                  >
                    {needsCourse ? null : <option value="">No course</option>}
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}

              {kind === "deadline" ? (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="day-priority">Priority</Label>
                    <select id="day-priority" name="priority" defaultValue="MEDIUM" className={SELECT_CLASS}>
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="day-description">Description (optional)</Label>
                    <Textarea id="day-description" name="description" rows={2} maxLength={2000} />
                  </div>
                </>
              ) : null}

              {kind === "exam" ? (
                <div className="space-y-1.5">
                  <Label htmlFor="day-notes">Notes (optional)</Label>
                  <Textarea
                    id="day-notes"
                    name="notes"
                    rows={2}
                    maxLength={2000}
                    placeholder="Room, chapters, format…"
                  />
                </div>
              ) : null}

              {error ? (
                <p role="alert" className="text-destructive text-sm">
                  {error}
                </p>
              ) : null}

              <div className="flex justify-end gap-2 pt-1">
                <Dialog.Close render={<Button type="button" variant="outline" />}>Cancel</Dialog.Close>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Adding…" : `Add ${KINDS.find((k) => k.value === kind)!.label.toLowerCase()}`}
                </Button>
              </div>
            </form>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
