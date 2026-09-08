import { GraduationCap } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { IconTile } from "@/components/icon-tile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/db";

import { CreateExamForm } from "../_components/create-exam-form";
import { ExamCard } from "../_components/exam-card";

export async function generateMetadata({
  params,
}: PageProps<"/courses/[id]/exams">): Promise<Metadata> {
  const userId = await requireUserId();
  const { id } = await params;
  const course = await db.course.findFirst({ where: { id, userId }, select: { title: true } });

  return { title: course ? `Exams — ${course.title}` : "Course not found" };
}

export default async function ExamsPage({
  params,
}: PageProps<"/courses/[id]/exams">) {
  const userId = await requireUserId();
  const { id: courseId } = await params;

  const course = await db.course.findFirst({
    where: { id: courseId, userId },
    include: {
      exams: { orderBy: { examDate: "asc" } },
    },
  });

  if (!course) {
    notFound();
  }

  return (
    <main className="max-w-2xl">
      <header className="mb-8 flex items-center gap-3">
        <IconTile color="purple">
          <GraduationCap className="size-5" />
        </IconTile>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Exams</h1>
          <p className="text-muted-foreground text-sm">
            Dated exams for {course.title}, soonest first.
          </p>
        </div>
      </header>

      <Card className="mb-10">
        <CardHeader>
          <CardTitle>Add an exam</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateExamForm courseId={course.id} />
        </CardContent>
      </Card>

      <section aria-labelledby="exam-list-heading">
        <h2 id="exam-list-heading" className="mb-4 text-lg font-bold">
          {course.exams.length} {course.exams.length === 1 ? "exam" : "exams"}
        </h2>

        {course.exams.length === 0 ? (
          <p className="text-muted-foreground rounded-2xl border border-dashed p-8 text-center text-sm">
            No exams yet. Add your first one above.
          </p>
        ) : (
          <ul className="space-y-4">
            {course.exams.map((exam) => (
              <li key={exam.id}>
                <ExamCard courseId={course.id} exam={exam} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
