"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";

import { createNote } from "../actions";
import { initialNoteFormState } from "../note-form-state";

export function CreateNoteForm({ courseId }: { courseId: string }) {
  const [state, formAction, isPending] = useActionState(
    createNote.bind(null, courseId),
    initialNoteFormState,
  );

  return (
    <form
      // Remounting on each submission lets the inputs pick up `defaultValue`
      // again: cleared after a success, refilled after a validation error.
      key={state.submission}
      action={formAction}
      className="space-y-4"
      noValidate
    >
      <div className="space-y-2">
        <Label htmlFor="note-title">Title</Label>
        <Input
          id="note-title"
          name="title"
          placeholder="Chapter 3 summary"
          defaultValue={state.values?.title}
          maxLength={100}
          aria-invalid={Boolean(state.errors?.title)}
          aria-describedby={
            state.errors?.title ? "note-title-error" : undefined
          }
        />
        {state.errors?.title ? (
          <p id="note-title-error" className="text-destructive text-sm">
            {state.errors.title[0]}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="note-content">Content (optional)</Label>
        <RichTextEditor
          id="note-content"
          name="content"
          placeholder="Whatever you want to remember."
          defaultValue={state.values?.content}
          ariaInvalid={Boolean(state.errors?.content)}
          ariaDescribedBy={
            state.errors?.content ? "note-content-error" : undefined
          }
        />
        {state.errors?.content ? (
          <p id="note-content-error" className="text-destructive text-sm">
            {state.errors.content[0]}
          </p>
        ) : null}
      </div>

      {state.message ? (
        <p role="alert" className="text-destructive text-sm">
          {state.message}
        </p>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Adding…" : "Add note"}
      </Button>
    </form>
  );
}
