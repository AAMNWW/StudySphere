import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/lib/db";

import { CreateNoteForm } from "./_components/create-note-form";
import { DeleteCourseButton } from "./_components/delete-course-button";
import { DeleteNoteButton } from "./_components/delete-note-button";
import { EditCourseForm } from "./_components/edit-course-form";

// Fixed locale and time zone so the server always renders the same string a
// user would see, regardless of where the server happens to run.
const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeZone: "UTC",
});

export async function generateMetadata({
  params,
}: PageProps<"/courses/[id]">): Promise<Metadata> {
  const { id } = await params;
  const course = await db.course.findUnique({
    where: { id },
    select: { title: true },
  });

  return { title: course?.title ?? "Course not found" };
}

export default async function CoursePage({
  params,
}: PageProps<"/courses/[id]">) {
  const { id } = await params;
  const course = await db.course.findUnique({
    where: { id },
    include: { notes: { orderBy: { createdAt: "desc" } } },
  });

  if (!course) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <Link
        href="/courses"
        className="text-muted-foreground text-sm hover:underline"
      >
        ← Back to courses
      </Link>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Edit course</CardTitle>
        </CardHeader>
        <CardContent>
          <EditCourseForm course={course} />
        </CardContent>
      </Card>

      <div className="mt-6 flex justify-end">
        <DeleteCourseButton courseId={course.id} courseTitle={course.title} />
      </div>

      <Card className="mt-10">
        <CardHeader>
          <CardTitle>Add a note</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateNoteForm courseId={course.id} />
        </CardContent>
      </Card>

      <section aria-labelledby="note-list-heading" className="mt-8">
        <h2 id="note-list-heading" className="mb-4 text-lg font-medium">
          {course.notes.length}{" "}
          {course.notes.length === 1 ? "note" : "notes"}
        </h2>

        {course.notes.length === 0 ? (
          <p className="text-muted-foreground rounded-lg border border-dashed p-8 text-center text-sm">
            No notes yet. Add your first one above.
          </p>
        ) : (
          <ul className="space-y-4">
            {course.notes.map((note) => (
              <li key={note.id}>
                <Card>
                  <CardHeader>
                    <CardTitle>{note.title}</CardTitle>
                    <p className="text-muted-foreground mt-1 text-xs">
                      Added {dateFormatter.format(note.createdAt)}
                    </p>
                    <CardAction>
                      <DeleteNoteButton
                        courseId={course.id}
                        noteId={note.id}
                        noteTitle={note.title}
                      />
                    </CardAction>
                  </CardHeader>
                  {note.content ? (
                    <CardContent>
                      <p className="text-sm whitespace-pre-wrap">
                        {note.content}
                      </p>
                    </CardContent>
                  ) : null}
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
