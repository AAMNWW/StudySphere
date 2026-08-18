"use client";

import { Sparkles } from "lucide-react";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";

import { generateDocumentSummary } from "../actions";
import { initialSummarizeDocumentFormState } from "../summarize-document-form-state";

export function SummarizeDocumentButton({
  courseId,
  documentId,
  hasSummary,
}: {
  courseId: string;
  documentId: string;
  hasSummary: boolean;
}) {
  // Errors are persisted on the document and rendered by DocumentRow, so
  // the action's returned state only needs to drive the pending label here.
  const [, formAction, isPending] = useActionState(
    generateDocumentSummary.bind(null, courseId, documentId),
    initialSummarizeDocumentFormState,
  );

  return (
    <form action={formAction}>
      <Button type="submit" variant="outline" size="sm" disabled={isPending}>
        <Sparkles />
        {isPending
          ? "Summarizing…"
          : hasSummary
            ? "Regenerate summary"
            : "Summarize"}
      </Button>
    </form>
  );
}
