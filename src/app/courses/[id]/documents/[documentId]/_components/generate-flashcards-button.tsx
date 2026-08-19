"use client";

import { Layers3 } from "lucide-react";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";

import { initialAsyncActionFormState } from "../../../async-action-state";
import { generateFlashcardSet } from "../actions";

export function GenerateFlashcardsButton({
  courseId,
  documentId,
  hasSet,
}: {
  courseId: string;
  documentId: string;
  hasSet: boolean;
}) {
  const [state, formAction, isPending] = useActionState(
    generateFlashcardSet.bind(null, courseId, documentId),
    initialAsyncActionFormState,
  );

  return (
    <form action={formAction} className="space-y-2">
      <Button type="submit" variant="outline" size="sm" disabled={isPending}>
        <Layers3 />
        {isPending ? "Generating…" : hasSet ? "Regenerate flashcards" : "Generate flashcards"}
      </Button>
      {state.status === "error" && state.message ? (
        <p role="alert" className="text-destructive text-xs">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
