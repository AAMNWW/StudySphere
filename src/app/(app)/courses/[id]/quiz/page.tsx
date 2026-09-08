import { SquareStack } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { IconTile } from "@/components/icon-tile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/db";

import { GenerateQuizForm } from "./_components/generate-quiz-form";

const DIFFICULTY_LABELS: Record<string, string> = {
  EASY: "Easy",
  MEDIUM: "Medium",
  HARD: "Hard",
  PRO: "Pro",
  MASTER: "Master",
};

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeZone: "UTC",
});

export async function generateMetadata({
  params,
}: PageProps<"/courses/[id]/quiz">): Promise<Metadata> {
  const userId = await requireUserId();
  const { id } = await params;
  const course = await db.course.findFirst({ where: { id, userId }, select: { title: true } });

  return { title: course ? `Quiz — ${course.title}` : "Course not found" };
}

export default async function QuizHubPage({
  params,
  searchParams,
}: PageProps<"/courses/[id]/quiz">) {
  const userId = await requireUserId();
  const { id: courseId } = await params;
  const { documentIds } = await searchParams;
  const defaultDocumentIds =
    typeof documentIds === "string" ? [documentIds] : documentIds;

  const course = await db.course.findFirst({ where: { id: courseId, userId } });

  if (!course) {
    notFound();
  }

  const [documents, quizzes] = await Promise.all([
    db.document.findMany({
      where: { courseId },
      orderBy: { createdAt: "desc" },
      select: { id: true, fileName: true },
    }),
    db.quiz.findMany({
      where: { courseId },
      orderBy: { createdAt: "desc" },
      include: { questions: { select: { selectedIndex: true, correctIndex: true } } },
    }),
  ]);

  return (
    <main className="max-w-2xl">
      <header className="mb-8 flex items-center gap-3">
        <IconTile color="purple">
          <SquareStack className="size-5" />
        </IconTile>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quiz</h1>
          <p className="text-muted-foreground text-sm">
            Test yourself on this course, a document, or a specific topic.
          </p>
        </div>
      </header>

      <Card className="mb-10">
        <CardHeader>
          <CardTitle>New quiz</CardTitle>
        </CardHeader>
        <CardContent>
          <GenerateQuizForm
            courseId={courseId}
            documents={documents}
            defaultDocumentIds={defaultDocumentIds}
          />
        </CardContent>
      </Card>

      <section aria-labelledby="quiz-list-heading">
        <h2 id="quiz-list-heading" className="mb-4 text-lg font-bold">
          {quizzes.length} past {quizzes.length === 1 ? "quiz" : "quizzes"}
        </h2>

        {quizzes.length === 0 ? (
          <p className="text-muted-foreground rounded-2xl border border-dashed p-8 text-center text-sm">
            No quizzes yet. Generate your first one above.
          </p>
        ) : (
          <ul className="space-y-3">
            {quizzes.map((quiz) => {
              const total = quiz.questions.length;
              const answered = quiz.questions.filter((q) => q.selectedIndex !== null).length;
              const correct = quiz.questions.filter(
                (q) => q.selectedIndex === q.correctIndex,
              ).length;

              return (
                <li key={quiz.id}>
                  <Link href={`/courses/${courseId}/quiz/${quiz.id}`} className="block">
                    <Card className="transition-colors hover:bg-muted/50">
                      <CardHeader>
                        <div className="flex items-center justify-between gap-2">
                          <CardTitle className="text-base">{quiz.title}</CardTitle>
                          <span className="text-muted-foreground text-xs">
                            {dateFormatter.format(quiz.createdAt)}
                          </span>
                        </div>
                        <p className="text-muted-foreground mt-1 text-sm">
                          {DIFFICULTY_LABELS[quiz.difficulty]} · {total}{" "}
                          {total === 1 ? "question" : "questions"}
                          {answered === total && total > 0
                            ? ` · ${correct}/${total} correct`
                            : answered > 0
                              ? ` · ${answered}/${total} answered`
                              : ""}
                        </p>
                      </CardHeader>
                    </Card>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
