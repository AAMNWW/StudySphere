import { FileText, ListTodo, StickyNote } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { IconTile } from "@/components/icon-tile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import { isAssignmentOverdue } from "@/lib/is-assignment-overdue";

import { AssignmentCard } from "./_components/assignment-card";
import { CreateAssignmentForm } from "./_components/create-assignment-form";
import { CreateNoteForm } from "./_components/create-note-form";
import { DeleteCourseButton } from "./_components/delete-course-button";
import { DocumentRow } from "./_components/document-row";
import { EditCourseForm } from "./_components/edit-course-form";
import { NoteCard } from "./_components/note-card";
import { UploadDocumentForm } from "./_components/upload-document-form";

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
  const course = await db.course.findFirst({
    where: { id, userId },
    include: {
      notes: { orderBy: { createdAt: "desc" } },
      assignments: {
        orderBy: [
          { completed: "asc" },
          { dueDate: { sort: "asc", nulls: "last" } },
        ],
      },
      documents: { orderBy: { createdAt: "desc" } },
    },
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
          <CardTitle>Add a document</CardTitle>
        </CardHeader>
        <CardContent>
          <UploadDocumentForm courseId={course.id} />
        </CardContent>
      </Card>

      <section aria-labelledby="document-list-heading" className="mt-8">
        <h2
          id="document-list-heading"
          className="mb-4 flex items-center gap-2 text-lg font-bold"
        >
          <IconTile color="blue" size="sm">
            <FileText className="size-4" />
          </IconTile>
          {course.documents.length}{" "}
          {course.documents.length === 1 ? "document" : "documents"}
        </h2>

        {course.documents.length === 0 ? (
          <p className="text-muted-foreground rounded-2xl border border-dashed p-8 text-center text-sm">
            No documents yet. Upload your first one above.
          </p>
        ) : (
          <ul className="space-y-4">
            {course.documents.map((document) => (
              <li key={document.id}>
                <DocumentRow courseId={course.id} document={document} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <Card className="mt-10">
        <CardHeader>
          <CardTitle>Add an assignment</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateAssignmentForm courseId={course.id} />
        </CardContent>
      </Card>

      <section aria-labelledby="assignment-list-heading" className="mt-8">
        <h2
          id="assignment-list-heading"
          className="mb-4 flex items-center gap-2 text-lg font-bold"
        >
          <IconTile color="purple" size="sm">
            <ListTodo className="size-4" />
          </IconTile>
          {course.assignments.length}{" "}
          {course.assignments.length === 1 ? "assignment" : "assignments"}
        </h2>

        {course.assignments.length === 0 ? (
          <p className="text-muted-foreground rounded-2xl border border-dashed p-8 text-center text-sm">
            No assignments yet. Add your first one above.
          </p>
        ) : (
          <ul className="space-y-4">
            {course.assignments.map((assignment) => (
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

      <Card className="mt-10">
        <CardHeader>
          <CardTitle>Add a note</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateNoteForm courseId={course.id} />
        </CardContent>
      </Card>

      <section aria-labelledby="note-list-heading" className="mt-8">
        <h2
          id="note-list-heading"
          className="mb-4 flex items-center gap-2 text-lg font-bold"
        >
          <IconTile color="yellow" size="sm">
            <StickyNote className="size-4" />
          </IconTile>
          {course.notes.length}{" "}
          {course.notes.length === 1 ? "note" : "notes"}
        </h2>

        {course.notes.length === 0 ? (
          <p className="text-muted-foreground rounded-2xl border border-dashed p-8 text-center text-sm">
            No notes yet. Add your first one above.
          </p>
        ) : (
          <ul className="space-y-4">
            {course.notes.map((note) => (
              <li key={note.id}>
                <NoteCard courseId={course.id} note={note} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
