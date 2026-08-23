import { notFound } from "next/navigation";

import { CourseSidebar } from "@/components/course-sidebar";
import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function CourseLayout({
  params,
  children,
}: LayoutProps<"/courses/[id]">) {
  const userId = await requireUserId();
  const { id: courseId } = await params;

  const course = await db.course.findFirst({
    where: { id: courseId, userId },
    select: { id: true, title: true },
  });

  if (!course) {
    notFound();
  }

  const [
    documents,
    notes,
    assignments,
    completedAssignments,
    quizzes,
    flashcardSets,
    chatThreads,
    topics,
  ] = await Promise.all([
    db.document.count({ where: { courseId } }),
    db.note.count({ where: { courseId } }),
    db.assignment.count({ where: { courseId } }),
    db.assignment.count({ where: { courseId, completed: true } }),
    db.quiz.count({ where: { courseId } }),
    db.flashcardSet.count({ where: { courseId } }),
    db.chatThread.count({ where: { courseId } }),
    db.topic.count({ where: { courseId } }),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 md:flex-row md:gap-8">
      <CourseSidebar
        courseId={course.id}
        courseTitle={course.title}
        counts={{ documents, notes, assignments, quizzes, flashcardSets, chatThreads, topics }}
        progress={{ completed: completedAssignments, total: assignments }}
      />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
