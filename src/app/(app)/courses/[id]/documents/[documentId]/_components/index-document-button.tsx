"use client";

import { Search } from "lucide-react";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";

import { initialAsyncActionFormState } from "../../../async-action-state";
import { indexDocumentAction } from "../actions";

export function IndexDocumentButton({
  courseId,
  documentId,
  indexed,
  chunkCount,
}: {
  courseId: string;
  documentId: string;
  indexed: boolean;
  chunkCount: number;
}) {
  const [state, formAction, isPending] = useActionState(
    indexDocumentAction.bind(null, courseId, documentId),
    initialAsyncActionFormState,
  );

  return (
    <form action={formAction} className="space-y-2">
      <div className="flex items-center gap-2">
        <Button type="submit" variant="outline" size="sm" disabled={isPending}>
          <Search />
          {isPending
            ? "Indexing…"
            : indexed
              ? "Re-index for search"
              : "Index for search"}
        </Button>
        {indexed && !isPending ? (
          <span className="text-muted-foreground text-xs">
            {chunkCount} {chunkCount === 1 ? "chunk" : "chunks"} indexed
          </span>
        ) : null}
      </div>
      {state.status === "error" && state.message ? (
        <p role="alert" className="text-destructive text-xs">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
