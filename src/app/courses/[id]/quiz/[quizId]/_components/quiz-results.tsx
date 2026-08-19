import { CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

const DIFFICULTY_LABELS: Record<string, string> = {
  EASY: "Easy",
  MEDIUM: "Medium",
  HARD: "Hard",
  PRO: "Pro",
  MASTER: "Master",
};

interface QuizQuestionItem {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  selectedIndex: number | null;
  order: number;
}

export function QuizResults({
  courseId,
  difficulty,
  questions,
}: {
  courseId: string;
  difficulty: string;
  questions: QuizQuestionItem[];
}) {
  const total = questions.length;
  const correct = questions.filter((q) => q.selectedIndex === q.correctIndex).length;
  const percent = total > 0 ? Math.round((correct / total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-2xl border border-black/5 p-6 text-center shadow-sm">
        <p className="text-4xl font-bold tabular-nums">
          {correct} / {total}
        </p>
        <p className="text-muted-foreground mt-1 text-sm">
          {percent}% correct · {DIFFICULTY_LABELS[difficulty] ?? difficulty} difficulty
        </p>
        <div className="mt-4 flex justify-center gap-3 text-sm">
          <Link href={`/courses/${courseId}/quiz`} className="underline">
            Back to quizzes
          </Link>
          <span className="text-muted-foreground">·</span>
          <Link href={`/courses/${courseId}/history`} className="underline">
            View wrong-answer history
          </Link>
        </div>
      </div>

      <ul className="space-y-3">
        {questions
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((question, index) => {
            const isCorrect = question.selectedIndex === question.correctIndex;

            return (
              <li
                key={question.id}
                className="bg-card rounded-2xl border border-black/5 p-4 shadow-sm"
              >
                <div className="flex items-start gap-2">
                  {isCorrect ? (
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                  ) : (
                    <XCircle className="mt-0.5 size-4 shrink-0 text-red-600" />
                  )}
                  <p className="text-sm font-medium">
                    {index + 1}. {question.question}
                  </p>
                </div>
                <div className="mt-2 ml-6 space-y-1 text-sm">
                  <p className={cn(isCorrect ? "text-emerald-700" : "text-red-700")}>
                    Your answer:{" "}
                    {question.selectedIndex !== null
                      ? question.options[question.selectedIndex]
                      : "—"}
                  </p>
                  {!isCorrect ? (
                    <p className="text-muted-foreground">
                      Correct answer: {question.options[question.correctIndex]}
                    </p>
                  ) : null}
                </div>
              </li>
            );
          })}
      </ul>
    </div>
  );
}
