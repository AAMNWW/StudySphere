"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { uploadDocument } from "../actions";
import { initialDocumentFormState } from "../document-form-state";

export function UploadDocumentForm({ courseId }: { courseId: string }) {
  const [state, formAction, isPending] = useActionState(
    uploadDocument.bind(null, courseId),
    initialDocumentFormState,
  );

  return (
    <form
      // Remounting after every submission clears the file input, whether
      // the upload succeeded or failed.
      key={state.submission}
      action={formAction}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="file">File</Label>
        <Input
          id="file"
          name="file"
          type="file"
          accept=".pdf,.docx,.pptx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation"
          aria-invalid={state.status === "error"}
        />
        <p className="text-muted-foreground text-xs">
          PDF, Word (.docx) or PowerPoint (.pptx), up to 15MB.
        </p>
      </div>

      {state.message ? (
        <p role="alert" className="text-destructive text-sm">
          {state.message}
        </p>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Uploading…" : "Upload"}
      </Button>
    </form>
  );
}
