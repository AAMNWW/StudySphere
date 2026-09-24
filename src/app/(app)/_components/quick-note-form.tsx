"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useRef, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { createQuickNote } from "../actions";

/** Dashboard quick-add for notes, mirroring TaskList's add row. Notes live
 * inside a course, so it also asks which one — defaulting to the most
 * recently created course. */
export function QuickNoteForm({ courses }: { courses: { id: string; title: string }[] }) {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  if (courses.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        <Link href="/courses" className="underline underline-offset-4">
          Add a course
        </Link>{" "}
        to start taking notes.
      </p>
    );
  }

  return (
    <form
      ref={formRef}
      action={(formData) => {
        startTransition(() => {
          createQuickNote(formData);
        });
        // Keep the chosen course selected for the next note; clear the title.
        const title = formRef.current?.elements.namedItem("title");
        if (title instanceof HTMLInputElement) title.value = "";
      }}
      className="space-y-2"
    >
      <div className="flex gap-2">
        <Input
          type="text"
          name="title"
          required
          maxLength={100}
          placeholder="Add a note…"
          className="flex-1"
        />
        <Button type="submit" size="icon" disabled={isPending} aria-label="Add note">
          <Plus />
        </Button>
      </div>
      <select
        name="courseId"
        aria-label="Course"
        defaultValue={courses[0].id}
        className="border-input focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 h-8 w-full rounded-lg border bg-transparent px-2 text-sm outline-none focus-visible:ring-3"
      >
        {courses.map((course) => (
          <option key={course.id} value={course.id}>
            {course.title}
          </option>
        ))}
      </select>
    </form>
  );
}
