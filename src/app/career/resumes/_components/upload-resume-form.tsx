"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { uploadResume } from "../actions";
import { initialResumeFormState } from "../resume-form-state";

export function UploadResumeForm() {
  const [state, formAction, isPending] = useActionState(
    uploadResume,
    initialResumeFormState,
  );

  return (
    <form
      // Remounting after every submission clears both fields, whether the
      // upload succeeded or failed.
      key={state.submission}
      action={formAction}
      className="space-y-4"
      noValidate
    >
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          placeholder="Software Engineer Resume"
          defaultValue={state.values?.title}
          maxLength={100}
          aria-invalid={Boolean(state.errors?.title)}
        />
        {state.errors?.title ? (
          <p className="text-destructive text-sm">{state.errors.title[0]}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="file">File</Label>
        <Input
          id="file"
          name="file"
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        />
        <p className="text-muted-foreground text-xs">PDF or Word (.docx), up to 15MB.</p>
      </div>

      {state.message ? (
        <p role="alert" className="text-destructive text-sm">
          {state.message}
        </p>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Uploading…" : "Upload resume"}
      </Button>
    </form>
  );
}
