import { BookOpen, Eye, FileText, GraduationCap, ListTodo, StickyNote } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { GradeBadge } from "@/components/grade-badge";
import { IconTile } from "@/components/icon-tile";
import { PriorityBadge } from "@/components/priority-badge";
import { NoteContent } from "@/app/courses/[id]/_components/note-content";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import { isAssignmentOverdue } from "@/lib/is-assignment-overdue";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeZone: "UTC",
});

export async function generateMetadata({
  params,
}: PageProps<"/shared/[token]">): Promise<Metadata> {
  const { token } = await params;
  const share = await db.courseShare.findUnique({
    where: { token },
    select: { course: { select: { title: true } } },
  });

  return { title: share ? `${share.course.title} (shared)` : "Shared course not found" };
}

/**
 * Read-only "study group" view of a course, reached via the link a student
 * turns on in Course Settings — see src/app/courses/[id]/actions.ts's
 * enable/disable/regenerateCourseShare. Deliberately built from scratch
 * rather than reusing AssignmentCard/NoteCard/ExamCard, which carry
 * edit/delete affordances baked in: a viewer here should never be able to
 * mutate anything, trigger an AI call billed to the owner, or see the
 * owner's private study data (analytics, study sessions, chat history).
 * Requires being signed in (any account, not specifically invited) — the
 * token itself is the real access control, matching how the document
 * download route treats an active share.
 */
export default async function SharedCoursePage({
  params,
}: PageProps<"/shared/[token]">) {
  await requireUserId();
  const { token } = await params;

  const share = await db.courseShare.findUnique({
    where: { token },
    include: {
      course: {
        include: {
          notes: { orderBy: { createdAt: "desc" } },
          documents: { orderBy: { createdAt: "desc" } },
          assignments: {
            orderBy: [{ completed: "asc" }, { dueDate: { sort: "asc", nulls: "last" } }],
          },
          exams: { orderBy: { examDate: "asc" } },
          topics: {
            orderBy: [{ weekNumber: { sort: "asc", nulls: "last" } }, { createdAt: "asc" }],
          },
        },
      },
    },
  });

  if (!share) {
    notFound();
  }

  const { course } = share;

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      <div className="bg-muted mb-8 flex items-center gap-3 rounded-2xl border px-4 py-3">
        <Eye className="text-muted-foreground size-4 shrink-0" />
        <p className="text-muted-foreground text-sm">
          You&apos;re viewing a shared, read-only copy of this course.{" "}
          <Link href="/" className="underline underline-offset-4">
            Back to your dashboard
          </Link>
        </p>
      </div>

      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">{course.title}</h1>
        {course.description ? (
          <p className="text-muted-foreground mt-2 text-sm">{course.description}</p>
        ) : null}
      </header>

      <section aria-labelledby="shared-assignments-heading" className="mb-10">
        <h2
          id="shared-assignments-heading"
          className="mb-4 flex items-center gap-2 text-lg font-bold"
        >
          <IconTile color="yellow" size="sm">
            <ListTodo className="size-4" />
          </IconTile>
          Assignments
        </h2>
        {course.assignments.length === 0 ? (
          <p className="text-muted-foreground rounded-2xl border border-dashed p-6 text-center text-sm">
            No assignments.
          </p>
        ) : (
          <ul className="space-y-2">
            {course.assignments.map((assignment) => (
              <li
                key={assignment.id}
                className="bg-card rounded-xl border border-black/5 px-4 py-3 shadow-sm"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p
                    className={
                      assignment.completed
                        ? "text-muted-foreground text-sm font-medium line-through"
                        : "text-sm font-medium"
                    }
                  >
                    {assignment.title}
                  </p>
                  <PriorityBadge priority={assignment.priority} hideMedium />
                  <GradeBadge
                    earnedPoints={assignment.earnedPoints}
                    maxPoints={assignment.maxPoints}
                  />
                </div>
                {assignment.dueDate ? (
                  <p
                    className={
                      isAssignmentOverdue(assignment)
                        ? "text-destructive mt-1 text-xs"
                        : "text-muted-foreground mt-1 text-xs"
                    }
                  >
                    Due {dateFormatter.format(assignment.dueDate)}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="shared-exams-heading" className="mb-10">
        <h2 id="shared-exams-heading" className="mb-4 flex items-center gap-2 text-lg font-bold">
          <IconTile color="red" size="sm">
            <GraduationCap className="size-4" />
          </IconTile>
          Exams
        </h2>
        {course.exams.length === 0 ? (
          <p className="text-muted-foreground rounded-2xl border border-dashed p-6 text-center text-sm">
            No exams.
          </p>
        ) : (
          <ul className="space-y-2">
            {course.exams.map((exam) => (
              <li
                key={exam.id}
                className="bg-card rounded-xl border border-black/5 px-4 py-3 shadow-sm"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium">{exam.title}</p>
                  <GradeBadge earnedPoints={exam.earnedPoints} maxPoints={exam.maxPoints} />
                </div>
                <p className="text-muted-foreground mt-1 text-xs">
                  {dateFormatter.format(exam.examDate)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mb-10 grid gap-8 sm:grid-cols-2">
        <section aria-labelledby="shared-documents-heading">
          <h2
            id="shared-documents-heading"
            className="mb-4 flex items-center gap-2 text-lg font-bold"
          >
            <IconTile color="blue" size="sm">
              <FileText className="size-4" />
            </IconTile>
            Documents
          </h2>
          {course.documents.length === 0 ? (
            <p className="text-muted-foreground rounded-2xl border border-dashed p-6 text-center text-sm">
              No documents.
            </p>
          ) : (
            <ul className="space-y-2">
              {course.documents.map((document) => (
                <li
                  key={document.id}
                  className="bg-card rounded-xl border border-black/5 px-4 py-3 shadow-sm"
                >
                  <a
                    href={`/api/documents/${document.id}`}
                    className="truncate text-sm font-medium hover:underline"
                  >
                    {document.fileName}
                  </a>
                  {document.summary ? (
                    <p className="text-muted-foreground mt-1 text-xs">{document.summary}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="shared-notes-heading">
          <h2 id="shared-notes-heading" className="mb-4 flex items-center gap-2 text-lg font-bold">
            <IconTile color="yellow" size="sm">
              <StickyNote className="size-4" />
            </IconTile>
            Notes
          </h2>
          {course.notes.length === 0 ? (
            <p className="text-muted-foreground rounded-2xl border border-dashed p-6 text-center text-sm">
              No notes.
            </p>
          ) : (
            <ul className="space-y-2">
              {course.notes.map((note) => (
                <li
                  key={note.id}
                  className="bg-card rounded-xl border border-black/5 px-4 py-3 shadow-sm"
                >
                  <p className="truncate text-sm font-medium">{note.title}</p>
                  {note.content ? (
                    <div className="mt-1">
                      <NoteContent content={note.content} />
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {course.topics.length > 0 ? (
        <section aria-labelledby="shared-topics-heading">
          <h2
            id="shared-topics-heading"
            className="mb-4 flex items-center gap-2 text-lg font-bold"
          >
            <IconTile color="green" size="sm">
              <BookOpen className="size-4" />
            </IconTile>
            Topics
          </h2>
          <ul className="space-y-2">
            {course.topics.map((topic) => (
              <li key={topic.id}>
                <Card size="sm">
                  <CardHeader>
                    <CardTitle className="text-base">
                      {topic.weekNumber ? `Week ${topic.weekNumber} — ` : ""}
                      {topic.title}
                    </CardTitle>
                  </CardHeader>
                  {topic.description ? (
                    <CardContent>
                      <p className="text-muted-foreground text-sm">{topic.description}</p>
                    </CardContent>
                  ) : null}
                </Card>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
