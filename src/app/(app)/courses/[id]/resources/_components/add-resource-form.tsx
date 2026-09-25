"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { createResource } from "../actions";
import { initialResourceFormState } from "../resource-form-state";

export function AddResourceForm({ courseId }: { courseId: string }) {
  const [state, formAction, isPending] = useActionState(
    createResource.bind(null, courseId),
    initialResourceFormState,
  );

  return (
    <form key={state.submission} action={formAction} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="resource-url">Link</Label>
        <Input
          id="resource-url"
          name="url"
          type="url"
          inputMode="url"
          placeholder="https://www.youtube.com/watch?v=…"
          defaultValue={state.values?.url}
          aria-invalid={Boolean(state.errors?.url)}
        />
        {state.errors?.url ? <p className="text-destructive text-sm">{state.errors.url[0]}</p> : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="resource-title">Title (optional)</Label>
        <Input
          id="resource-title"
          name="title"
          maxLength={150}
          placeholder="Lecture 5: Deadlocks"
          defaultValue={state.values?.title}
          aria-invalid={Boolean(state.errors?.title)}
        />
        {state.errors?.title ? (
          <p className="text-destructive text-sm">{state.errors.title[0]}</p>
        ) : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="resource-note">Note (optional)</Label>
        <Textarea
          id="resource-note"
          name="note"
          rows={2}
          maxLength={500}
          placeholder="Why it's useful, which part to watch…"
          defaultValue={state.values?.note}
        />
        {state.errors?.note ? <p className="text-destructive text-sm">{state.errors.note[0]}</p> : null}
      </div>
      {state.message ? (
        <p role="alert" className="text-destructive text-sm">
          {state.message}
        </p>
      ) : null}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving…" : "Save link"}
      </Button>
    </form>
  );
}
