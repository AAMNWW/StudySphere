"use client";

import { useActionState } from "react";

import { DocumentMultiSelect, type SelectableDocument } from "@/components/document-multi-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { initialGenerationFormState } from "../../generation-form-state";
import { createChatThread } from "../actions";

export function NewChatForm({
  courseId,
  documents,
  defaultDocumentIds,
}: {
  courseId: string;
  documents: SelectableDocument[];
  defaultDocumentIds?: string[];
}) {
  const [state, formAction, isPending] = useActionState(
    createChatThread.bind(null, courseId),
    initialGenerationFormState,
  );

  return (
    <form key={state.submission} action={formAction} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label>Ground in documents (optional)</Label>
        <DocumentMultiSelect
          documents={documents}
          defaultSelectedIds={state.values?.documentIds ?? defaultDocumentIds}
          error={state.errors?.documentIds?.[0]}
        />
        <p className="text-muted-foreground text-xs">
          Leave everything unchecked for a general study-tutor chat about the course.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="chat-topic">Focus on a topic (optional)</Label>
        <Input
          id="chat-topic"
          name="topic"
          placeholder="e.g. the French Revolution"
          defaultValue={state.values?.topic}
          maxLength={200}
        />
      </div>

      {state.status === "error" && state.message ? (
        <p role="alert" className="text-destructive text-sm">
          {state.message}
        </p>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Starting…" : "Start chat"}
      </Button>
    </form>
  );
}
