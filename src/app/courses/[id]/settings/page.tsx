import { Settings } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { IconTile } from "@/components/icon-tile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import { getSiteUrl } from "@/lib/site-url";

import { CreditHoursForm } from "../_components/credit-hours-form";
import { DeleteCourseButton } from "../_components/delete-course-button";
import { EditCourseForm } from "../_components/edit-course-form";
import { ShareCourseControls } from "../_components/share-course-controls";

export async function generateMetadata({
  params,
}: PageProps<"/courses/[id]/settings">): Promise<Metadata> {
  const userId = await requireUserId();
  const { id } = await params;
  const course = await db.course.findFirst({ where: { id, userId }, select: { title: true } });

  return { title: course ? `Settings — ${course.title}` : "Course not found" };
}

export default async function CourseSettingsPage({
  params,
}: PageProps<"/courses/[id]/settings">) {
  const userId = await requireUserId();
  const { id: courseId } = await params;

  const course = await db.course.findFirst({
    where: { id: courseId, userId },
    include: { share: { select: { token: true } } },
  });

  if (!course) {
    notFound();
  }

  const shareUrl = course.share ? `${getSiteUrl()}/shared/${course.share.token}` : null;

  return (
    <main className="max-w-2xl">
      <header className="mb-8 flex items-center gap-3">
        <IconTile color="gray">
          <Settings className="size-5" />
        </IconTile>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground text-sm">Rename, describe, or delete this course.</p>
        </div>
      </header>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Edit course</CardTitle>
        </CardHeader>
        <CardContent>
          <EditCourseForm course={course} />
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Grades</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4 text-sm">
            Set how many credit hours this course is worth to include it in your{" "}
            <Link href="/grades" className="underline underline-offset-4">
              overall GPA
            </Link>
            . Enter grades on individual assignments and exams to see this course&apos;s grade.
          </p>
          <CreditHoursForm courseId={course.id} creditHours={course.creditHours} />
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Study group sharing</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4 text-sm">
            Anyone signed in with this link can view your notes, documents, assignments,
            exams and topics for this course — read-only, no editing, and no chat, quizzes,
            flashcards or study planner access.
          </p>
          <ShareCourseControls courseId={course.id} shareUrl={shareUrl} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Delete course</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm">
            Permanently deletes this course and everything in it — documents, notes,
            assignments, quizzes, flashcards, chats and topics. This cannot be undone.
          </p>
          <DeleteCourseButton courseId={course.id} courseTitle={course.title} />
        </CardContent>
      </Card>
    </main>
  );
}
