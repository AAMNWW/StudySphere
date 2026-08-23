import { FileText, ListTodo, StickyNote } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { IconTile } from "@/components/icon-tile";
import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import { isAssignmentOverdue } from "@/lib/is-assignment-overdue";

import { AssignmentCard } from "./_components/assignment-card";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeZone: "UTC",
});

export async function generateMetadata({
  params,
}: PageProps<"/courses/[id]">): Promise<Metadata> {
  const userId = await requireUserId();
  const { id } = await params;
  const course = await db.course.findFirst({
    where: { id, userId },
    select: { title: true },
  });

  return { title: course?.title ?? "Course not found" };
}

export default async function CoursePage({
  params,
}: PageProps<"/courses/[id]">) {
  const userId = await requireUserId();
  const { id } = await params;
  const course = await db.course.findFirst({ where: { id, userId } });

  if (!course) {
    notFound();
  }

  const [dueSoon, recentDocuments, recentNotes] = await Promise.all([
    db.assignment.findMany({
      where: { courseId: course.id, completed: false },
      orderBy: { dueDate: { sort: "asc", nulls: "last" } },
      take: 5,
    }),
    db.document.findMany({
      where: { courseId: course.id },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { id: true, fileName: true, createdAt: true },
    }),
    db.note.findMany({
      where: { courseId: course.id },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { id: true, title: true, createdAt: true },
    }),
  ]);

  return (
    <main>
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">{course.title}</h1>
        {course.description ? (
          <p className="text-muted-foreground mt-2 text-sm">{course.description}</p>
        ) : null}
      </header>

      <section aria-labelledby="due-soon-heading" className="mb-10">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 id="due-soon-heading" className="flex items-center gap-2 text-lg font-bold">
            <IconTile color="yellow" size="sm">
              <ListTodo className="size-4" />
            </IconTile>
            Due soon
          </h2>
          <Link
            href={`/courses/${course.id}/assignments`}
            className="text-muted-foreground text-sm hover:underline"
          >
            See all assignments
          </Link>
        </div>

        {dueSoon.length === 0 ? (
          <p className="text-muted-foreground rounded-2xl border border-dashed p-8 text-center text-sm">
            Nothing due — add an assignment to start tracking deadlines.
          </p>
        ) : (
          <ul className="space-y-3">
            {dueSoon.map((assignment) => (
              <li key={assignment.id}>
                <AssignmentCard
                  courseId={course.id}
                  assignment={assignment}
                  isOverdue={isAssignmentOverdue(assignment)}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="grid gap-8 sm:grid-cols-2">
        <section aria-labelledby="recent-documents-heading">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 id="recent-documents-heading" className="flex items-center gap-2 text-lg font-bold">
              <IconTile color="blue" size="sm">
                <FileText className="size-4" />
              </IconTile>
              Documents
            </h2>
            <Link
              href={`/courses/${course.id}/documents`}
              className="text-muted-foreground text-sm hover:underline"
            >
              See all
            </Link>
          </div>

          {recentDocuments.length === 0 ? (
            <p className="text-muted-foreground rounded-2xl border border-dashed p-6 text-center text-sm">
              No documents yet.
            </p>
          ) : (
            <ul className="space-y-2">
              {recentDocuments.map((document) => (
                <li
                  key={document.id}
                  className="bg-card flex items-center justify-between gap-2 rounded-xl border border-black/5 px-4 py-3 text-sm shadow-sm"
                >
                  <span className="truncate">{document.fileName}</span>
                  <span className="text-muted-foreground shrink-0 text-xs">
                    {dateFormatter.format(document.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="recent-notes-heading">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 id="recent-notes-heading" className="flex items-center gap-2 text-lg font-bold">
              <IconTile color="yellow" size="sm">
                <StickyNote className="size-4" />
              </IconTile>
              Notes
            </h2>
            <Link
              href={`/courses/${course.id}/notes`}
              className="text-muted-foreground text-sm hover:underline"
            >
              See all
            </Link>
          </div>

          {recentNotes.length === 0 ? (
            <p className="text-muted-foreground rounded-2xl border border-dashed p-6 text-center text-sm">
              No notes yet.
            </p>
          ) : (
            <ul className="space-y-2">
              {recentNotes.map((note) => (
                <li
                  key={note.id}
                  className="bg-card flex items-center justify-between gap-2 rounded-xl border border-black/5 px-4 py-3 text-sm shadow-sm"
                >
                  <span className="truncate">{note.title}</span>
                  <span className="text-muted-foreground shrink-0 text-xs">
                    {dateFormatter.format(note.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
