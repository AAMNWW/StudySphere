"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { initialJobApplicationFormState, type JobApplicationFormState } from "../job-form-state";
import { JobStatusPicker } from "./job-status-picker";

type JobApplicationAction = (
  previousState: JobApplicationFormState,
  formData: FormData,
) => Promise<JobApplicationFormState>;

export function JobApplicationForm({
  action,
  initialValues,
  resumes,
  submitLabel,
  pendingLabel,
}: {
  action: JobApplicationAction;
  initialValues?: JobApplicationFormState["values"];
  resumes: { id: string; title: string }[];
  submitLabel: string;
  pendingLabel: string;
}) {
  const [state, formAction, isPending] = useActionState(action, {
    ...initialJobApplicationFormState,
    values: initialValues,
  });

  return (
    <form
      // Remounting on each submission lets the inputs pick up `defaultValue`
      // again after a validation error.
      key={state.submission}
      action={formAction}
      className="space-y-4"
      noValidate
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="company">Company</Label>
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
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Input
            id="role"
            name="role"
            placeholder="Software Engineer"
            defaultValue={state.values?.role}
            maxLength={100}
            aria-invalid={Boolean(state.errors?.role)}
          />
          {state.errors?.role ? (
            <p className="text-destructive text-sm">{state.errors.role[0]}</p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Status</Label>
        <JobStatusPicker defaultValue={state.values?.status} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="jobUrl">Job posting URL (optional)</Label>
        <Input
          id="jobUrl"
          name="jobUrl"
          type="url"
          placeholder="https://..."
          defaultValue={state.values?.jobUrl}
          aria-invalid={Boolean(state.errors?.jobUrl)}
        />
        {state.errors?.jobUrl ? (
          <p className="text-destructive text-sm">{state.errors.jobUrl[0]}</p>
        ) : null}
      </div>

      {resumes.length > 0 ? (
        <div className="space-y-2">
          <Label htmlFor="resumeId">Resume (optional)</Label>
          <select
            id="resumeId"
            name="resumeId"
            defaultValue={state.values?.resumeId ?? ""}
            className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-8 w-full rounded-lg border bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3"
          >
            <option value="">No resume selected</option>
            {resumes.map((resume) => (
              <option key={resume.id} value={resume.id}>
                {resume.title}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="jobDescription">Job description (optional)</Label>
        <Textarea
          id="jobDescription"
          name="jobDescription"
          placeholder="Paste the job posting so AI features can use it later."
          defaultValue={state.values?.jobDescription}
          maxLength={10000}
          rows={5}
          aria-invalid={Boolean(state.errors?.jobDescription)}
        />
        {state.errors?.jobDescription ? (
          <p className="text-destructive text-sm">{state.errors.jobDescription[0]}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          name="notes"
          placeholder="Contacts, interview prep, follow-ups…"
          defaultValue={state.values?.notes}
          maxLength={2000}
          rows={3}
          aria-invalid={Boolean(state.errors?.notes)}
        />
        {state.errors?.notes ? (
          <p className="text-destructive text-sm">{state.errors.notes[0]}</p>
        ) : null}
      </div>

      {state.message ? (
        <p role="alert" className="text-destructive text-sm">
          {state.message}
        </p>
      ) : null}
      {state.status === "success" ? (
        <p role="status" className="text-sm text-emerald-600">
          Saved.
        </p>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? pendingLabel : submitLabel}
      </Button>
    </form>
  );
}
