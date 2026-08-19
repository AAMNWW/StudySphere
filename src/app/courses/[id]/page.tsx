import { CalendarDays, FileText, ListTodo, MessageCircle, SquareStack, StickyNote, Layers3 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { FeatureTile } from "@/components/feature-tile";
import { IconTile } from "@/components/icon-tile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/db";

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
      documents: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!course) {
    notFound();
  }

  const [quizCount, flashcardSetCount, chatThreadCount, topicCount, assignmentCount] =
    await Promise.all([
      db.quiz.count({ where: { courseId: course.id } }),
      db.flashcardSet.count({ where: { courseId: course.id } }),
      db.chatThread.count({ where: { courseId: course.id } }),
      db.topic.count({ where: { courseId: course.id } }),
      db.assignment.count({ where: { courseId: course.id } }),
    ]);

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

      <section aria-labelledby="feature-grid-heading" className="mt-10">
        <h2 id="feature-grid-heading" className="sr-only">
          Study tools
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <li>
            <FeatureTile
              href={`/courses/${course.id}/quiz`}
              color="purple"
              icon={<SquareStack className="size-6" />}
              title="Quiz"
              description="Test yourself, with a difficulty you pick."
              count={quizCount}
            />
          </li>
          <li>
            <FeatureTile
              href={`/courses/${course.id}/flashcards`}
              color="blue"
              icon={<Layers3 className="size-6" />}
              title="Flashcards"
              description="Flip through key terms and concepts."
              count={flashcardSetCount}
            />
          </li>
          <li>
            <FeatureTile
              href={`/courses/${course.id}/chat`}
              color="pink"
              icon={<MessageCircle className="size-6" />}
              title="Chat"
              description="Ask the AI tutor about this course."
              count={chatThreadCount}
            />
          </li>
          <li>
            <FeatureTile
              href={`/courses/${course.id}/topics`}
              color="green"
              icon={<CalendarDays className="size-6" />}
              title="Topics"
              description="What to study this week."
              count={topicCount}
            />
          </li>
          <li>
            <FeatureTile
              href={`/courses/${course.id}/assignments`}
              color="yellow"
              icon={<ListTodo className="size-6" />}
              title="Assignments"
              description="Everything due for this course."
              count={assignmentCount}
            />
          </li>
        </ul>
      </section>

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
