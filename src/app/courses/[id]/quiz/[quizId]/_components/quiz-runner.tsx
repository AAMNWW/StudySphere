"use client";

import { useTransition } from "react";

import { cn } from "@/lib/utils";

import { submitQuizAnswer } from "../../actions";

interface QuizQuestionItem {
  id: string;
  question: string;
  options: string[];
  selectedIndex: number | null;
  order: number;
}

export function QuizRunner({
  courseId,
  quizId,
  questions,
}: {
  courseId: string;
  quizId: string;
  questions: QuizQuestionItem[];
}) {
  const [isPending, startTransition] = useTransition();
  const answered = questions.filter((q) => q.selectedIndex !== null).length;

  function selectOption(questionId: string, optionIndex: number) {
    startTransition(() => {
      void submitQuizAnswer(courseId, quizId, questionId, optionIndex);
    });
  }

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm">
        {answered} / {questions.length} answered
      </p>

      <ul className="space-y-4">
        {questions
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((question, index) => (
            <li
              key={question.id}
              className="bg-card rounded-2xl border border-black/5 p-4 shadow-sm"
            >
              <p className="text-sm font-medium">
                {index + 1}. {question.question}
              </p>
              <div className="mt-3 space-y-2">
                {question.options.map((option, optionIndex) => {
                  const isSelected = question.selectedIndex === optionIndex;

                  return (
                    <button
                      key={optionIndex}
                      type="button"
                      disabled={isPending}
                      onClick={() => selectOption(question.id, optionIndex)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm transition-colors",
                        isSelected
                          ? "border-primary bg-primary/10"
                          : "border-border hover:bg-muted",
                      )}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
}
