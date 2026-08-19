"use client";

import { SquareStack } from "lucide-react";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";

import { initialAsyncActionFormState } from "../../../async-action-state";
import { generateQuiz } from "../actions";

export function GenerateQuizButton({
  courseId,
  documentId,
  hasQuiz,
}: {
  courseId: string;
  documentId: string;
  hasQuiz: boolean;
}) {
  const [state, formAction, isPending] = useActionState(
    generateQuiz.bind(null, courseId, documentId),
    initialAsyncActionFormState,
  );

  return (
    <form action={formAction} className="space-y-2">
      <Button type="submit" variant="outline" size="sm" disabled={isPending}>
        <SquareStack />
        {isPending ? "Generating…" : hasQuiz ? "Regenerate quiz" : "Generate quiz"}
      </Button>
      {state.status === "error" && state.message ? (
        <p role="alert" className="text-destructive text-xs">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
