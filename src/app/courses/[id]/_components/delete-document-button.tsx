"use client";

import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import { deleteDocument } from "../actions";

export function DeleteDocumentButton({
  courseId,
  documentId,
  fileName,
}: {
  courseId: string;
  documentId: string;
  fileName: string;
}) {
  return (
    <form
      action={deleteDocument.bind(null, courseId, documentId)}
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
        aria-label={`Delete ${fileName}`}
      >
        <Trash2 />
      </Button>
    </form>
  );
}
