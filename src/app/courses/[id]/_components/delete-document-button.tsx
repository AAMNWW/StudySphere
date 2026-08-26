"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";

import { deleteDocument } from "../actions";

const initialState = { status: "success" } as const;

export function DeleteDocumentButton({
  courseId,
  documentId,
  fileName,
}: {
  courseId: string;
  documentId: string;
  fileName: string;
}) {
  const [state, formAction, isPending] = useActionState(
    deleteDocument.bind(null, courseId, documentId),
    initialState,
  );

  return (
    <div className="flex flex-col items-end gap-1">
      <form
        action={formAction}
        onSubmit={(event) => {
          if (!window.confirm(`Delete "${fileName}"? This cannot be undone.`)) {
            event.preventDefault();
          }
        }}
      >
        <Button
          type="submit"
          variant="ghost"
          size="icon-sm"
          disabled={isPending}
          aria-label={`Delete ${fileName}`}
        >
          {isPending ? <Loader2 className="animate-spin" /> : <Trash2 />}
        </Button>
      </form>
      {state.status === "error" ? (
        <p role="alert" className="text-destructive text-xs">
          {state.message}
        </p>
      ) : null}
    </div>
  );
}
