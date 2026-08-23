"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { createCareerChatThread } from "../actions";
import { initialNewCareerChatFormState } from "../career-chat-form-state";

export function NewCareerChatForm({ resumes }: { resumes: { id: string; title: string }[] }) {
  const [state, formAction, isPending] = useActionState(
    createCareerChatThread,
    initialNewCareerChatFormState,
  );

  return (
    <form key={state.submission} action={formAction} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="resumeId">Ground in a resume (optional)</Label>
        <select
          id="resumeId"
          name="resumeId"
          defaultValue={state.values?.resumeId ?? ""}
          className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-8 w-full rounded-lg border bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3"
        >
          <option value="">No resume — general career coach</option>
          {resumes.map((resume) => (
            <option key={resume.id} value={resume.id}>
              {resume.title}
            </option>
          ))}
        </select>
        <p className="text-muted-foreground text-xs">
          Pick a resume for feedback on it specifically, or leave it unselected for general
          career advice — job search strategy, interviews, negotiation, and more.
        </p>
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
