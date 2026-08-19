"use client";

import { Check, X } from "lucide-react";
import { useTransition } from "react";

import { cn } from "@/lib/utils";

import { submitQuizAnswer } from "../actions";

interface QuizQuestionItem {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  selectedIndex: number | null;
  order: number;
}

export function QuizPanel({
  courseId,
  documentId,
  quizId,
  questions,
}: {
  courseId: string;
  documentId: string;
  quizId: string;
  questions: QuizQuestionItem[];
}) {
  const [isPending, startTransition] = useTransition();

  const answered = questions.filter((q) => q.selectedIndex !== null).length;
  const correct = questions.filter((q) => q.selectedIndex === q.correctIndex).length;

  function selectOption(questionId: string, optionIndex: number) {
    startTransition(() => {
      void submitQuizAnswer(courseId, documentId, quizId, questionId, optionIndex);
    });
  }

  return (
    <div className="space-y-4">
      {answered > 0 ? (
        <p className="text-sm font-medium">
          {correct} / {answered} correct so far
          {answered < questions.length
            ? ` (${questions.length - answered} left)`
            : ""}
        </p>
      ) : null}

      <ul className="space-y-4">
        {questions
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((q, index) => {
            const isAnswered = q.selectedIndex !== null;

            return (
              <li key={q.id} className="bg-card rounded-2xl border border-black/5 p-4 shadow-sm">
                <p className="text-sm font-medium">
                  {index + 1}. {q.question}
                </p>
                <div className="mt-3 space-y-2">
                  {q.options.map((option, optionIndex) => {
                    const isSelected = q.selectedIndex === optionIndex;
                    const isCorrectOption = optionIndex === q.correctIndex;

                    return (
                      <button
                        key={optionIndex}
                        type="button"
                        disabled={isPending || isAnswered}
                        onClick={() => selectOption(q.id, optionIndex)}
                        className={cn(
                          "flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left text-sm transition-colors",
                          !isAnswered && "hover:bg-muted border-border",
                          isAnswered && isCorrectOption && "border-emerald-300 bg-emerald-50",
                          isAnswered &&
                            isSelected &&
                            !isCorrectOption &&
                            "border-red-300 bg-red-50",
                          isAnswered && !isSelected && !isCorrectOption && "border-border opacity-60",
                        )}
                      >
                        <span>{option}</span>
                        {isAnswered && isCorrectOption ? (
                          <Check className="size-4 shrink-0 text-emerald-600" />
                        ) : null}
                        {isAnswered && isSelected && !isCorrectOption ? (
                          <X className="size-4 shrink-0 text-red-600" />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </li>
            );
          })}
      </ul>
    </div>
  );
}
