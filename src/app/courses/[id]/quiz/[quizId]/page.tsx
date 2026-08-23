import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BackLink } from "@/components/back-link";
import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/db";

import { QuizResults } from "./_components/quiz-results";
import { QuizRunner } from "./_components/quiz-runner";

export async function generateMetadata({
  params,
}: PageProps<"/courses/[id]/quiz/[quizId]">): Promise<Metadata> {
  const userId = await requireUserId();
  const { id, quizId } = await params;
  const quiz = await db.quiz.findFirst({
    where: { id: quizId, courseId: id, course: { userId } },
    select: { title: true },
  });

  return { title: quiz?.title ?? "Quiz not found" };
}

export default async function QuizPage({
  params,
}: PageProps<"/courses/[id]/quiz/[quizId]">) {
  const userId = await requireUserId();
  const { id: courseId, quizId } = await params;

  const quiz = await db.quiz.findFirst({
    where: { id: quizId, courseId, course: { userId } },
    include: { questions: { orderBy: { order: "asc" } } },
  });

  if (!quiz) {
    notFound();
  }

  const questions = quiz.questions.map((question) => ({
    id: question.id,
    question: question.question,
    options: question.options as string[],
    correctIndex: question.correctIndex,
    selectedIndex: question.selectedIndex,
    order: question.order,
  }));
  const allAnswered =
    questions.length > 0 && questions.every((question) => question.selectedIndex !== null);

  return (
    <main className="max-w-2xl">
      <BackLink href={`/courses/${courseId}/quiz`}>Back to quizzes</BackLink>
      <h1 className="mt-4 mb-8 text-2xl font-bold tracking-tight">{quiz.title}</h1>

      {allAnswered ? (
        <QuizResults courseId={courseId} difficulty={quiz.difficulty} questions={questions} />
      ) : (
        <QuizRunner courseId={courseId} quizId={quiz.id} questions={questions} />
      )}
    </main>
  );
}
