"use client";

import { useActionState } from "react";

import { DocumentMultiSelect, type SelectableDocument } from "@/components/document-multi-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { initialGenerationFormState } from "../../generation-form-state";
import { generateQuiz } from "../actions";
import { DifficultyPicker } from "./difficulty-picker";

export function GenerateQuizForm({
  courseId,
  documents,
  defaultDocumentIds,
}: {
  courseId: string;
  documents: SelectableDocument[];
  defaultDocumentIds?: string[];
}) {
  const [state, formAction, isPending] = useActionState(
    generateQuiz.bind(null, courseId),
    initialGenerationFormState,
  );

  return (
    <form key={state.submission} action={formAction} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label>Documents</Label>
        <DocumentMultiSelect
          documents={documents}
          defaultSelectedIds={state.values?.documentIds ?? defaultDocumentIds}
          error={state.errors?.documentIds?.[0]}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="quiz-topic">Focus on a topic (optional)</Label>
        <Input
          id="quiz-topic"
          name="topic"
          placeholder="e.g. the French Revolution"
          defaultValue={state.values?.topic}
          maxLength={200}
        />
      </div>

      <div className="space-y-2">
        <Label>Difficulty</Label>
        <DifficultyPicker defaultValue={state.values?.difficulty ?? "MEDIUM"} />
      </div>

      {state.status === "error" && state.message ? (
        <p role="alert" className="text-destructive text-sm">
          {state.message}
        </p>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Generating…" : "Generate quiz"}
      </Button>
    </form>
  );
}
