"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { createInterviewSession } from "../actions";
import { initialNewInterviewFormState } from "../interview-form-state";

export function NewInterviewForm({ resumes }: { resumes: { id: string; title: string }[] }) {
  const [state, formAction, isPending] = useActionState(
    createInterviewSession,
    initialNewInterviewFormState,
  );

  return (
    <form key={state.submission} action={formAction} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Input
            id="role"
            name="role"
            placeholder="Frontend Engineer"
            defaultValue={state.values?.role}
            maxLength={100}
            aria-invalid={Boolean(state.errors?.role)}
          />
          {state.errors?.role ? (
            <p className="text-destructive text-sm">{state.errors.role[0]}</p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="company">Company (optional)</Label>
          <Input
            id="company"
            name="company"
            placeholder="Acme Inc."
            defaultValue={state.values?.company}
            maxLength={100}
            aria-invalid={Boolean(state.errors?.company)}
          />
          {state.errors?.company ? (
            <p className="text-destructive text-sm">{state.errors.company[0]}</p>
          ) : null}
        </div>
      </div>

      {resumes.length > 0 ? (
        <div className="space-y-2">
          <Label htmlFor="resumeId">Ground in a resume (optional)</Label>
          <select
            id="resumeId"
            name="resumeId"
            defaultValue={state.values?.resumeId ?? ""}
            className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-8 w-full rounded-lg border bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3"
          >
            <option value="">No resume</option>
            {resumes.map((resume) => (
              <option key={resume.id} value={resume.id}>
                {resume.title}
              </option>
            ))}
          </select>
          <p className="text-muted-foreground text-xs">
            Lets the interviewer ask questions specific to your background.
          </p>
        </div>
      ) : null}

      {state.status === "error" && state.message ? (
        <p role="alert" className="text-destructive text-sm">
          {state.message}
        </p>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Starting…" : "Start interview"}
      </Button>
    </form>
  );
}
