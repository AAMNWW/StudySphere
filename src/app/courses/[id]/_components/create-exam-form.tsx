"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { createExam } from "../actions";
import { initialExamFormState } from "../exam-form-state";

export function CreateExamForm({ courseId }: { courseId: string }) {
  const [state, formAction, isPending] = useActionState(
    createExam.bind(null, courseId),
    initialExamFormState,
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
        <Label htmlFor="exam-title">Title</Label>
        <Input
          id="exam-title"
          name="title"
          placeholder="Midterm"
          defaultValue={state.values?.title}
          maxLength={100}
          aria-invalid={Boolean(state.errors?.title)}
          aria-describedby={state.errors?.title ? "exam-title-error" : undefined}
        />
        {state.errors?.title ? (
          <p id="exam-title-error" className="text-destructive text-sm">
            {state.errors.title[0]}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="exam-date">Exam date</Label>
        <Input
          id="exam-date"
          name="examDate"
          type="date"
          defaultValue={state.values?.examDate}
          aria-invalid={Boolean(state.errors?.examDate)}
          aria-describedby={state.errors?.examDate ? "exam-date-error" : undefined}
        />
        {state.errors?.examDate ? (
          <p id="exam-date-error" className="text-destructive text-sm">
            {state.errors.examDate[0]}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="exam-notes">Notes (optional)</Label>
        <Textarea
          id="exam-notes"
          name="notes"
          placeholder="What to study, room number, format, etc."
          defaultValue={state.values?.notes}
          maxLength={2000}
          rows={3}
          aria-invalid={Boolean(state.errors?.notes)}
          aria-describedby={state.errors?.notes ? "exam-notes-error" : undefined}
        />
        {state.errors?.notes ? (
          <p id="exam-notes-error" className="text-destructive text-sm">
            {state.errors.notes[0]}
          </p>
        ) : null}
      </div>

      {state.message ? (
        <p role="alert" className="text-destructive text-sm">
          {state.message}
        </p>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Adding…" : "Add exam"}
      </Button>
    </form>
  );
}
