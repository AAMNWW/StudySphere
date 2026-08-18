"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { createAssignment } from "../actions";
import { initialAssignmentFormState } from "../assignment-form-state";

export function CreateAssignmentForm({ courseId }: { courseId: string }) {
  const [state, formAction, isPending] = useActionState(
    createAssignment.bind(null, courseId),
    initialAssignmentFormState,
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
        <Label htmlFor="assignment-title">Title</Label>
        <Input
          id="assignment-title"
          name="title"
          placeholder="Problem set 4"
          defaultValue={state.values?.title}
          maxLength={100}
          aria-invalid={Boolean(state.errors?.title)}
          aria-describedby={
            state.errors?.title ? "assignment-title-error" : undefined
          }
        />
        {state.errors?.title ? (
          <p id="assignment-title-error" className="text-destructive text-sm">
            {state.errors.title[0]}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="assignment-due-date">Due date (optional)</Label>
        <Input
          id="assignment-due-date"
          name="dueDate"
          type="date"
          defaultValue={state.values?.dueDate}
          aria-invalid={Boolean(state.errors?.dueDate)}
          aria-describedby={
            state.errors?.dueDate ? "assignment-due-date-error" : undefined
          }
        />
        {state.errors?.dueDate ? (
          <p id="assignment-due-date-error" className="text-destructive text-sm">
            {state.errors.dueDate[0]}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="assignment-description">Description (optional)</Label>
        <Textarea
          id="assignment-description"
          name="description"
          placeholder="What needs to be done."
          defaultValue={state.values?.description}
          maxLength={2000}
          rows={3}
          aria-invalid={Boolean(state.errors?.description)}
          aria-describedby={
            state.errors?.description
              ? "assignment-description-error"
              : undefined
          }
        />
        {state.errors?.description ? (
          <p
            id="assignment-description-error"
            className="text-destructive text-sm"
          >
            {state.errors.description[0]}
          </p>
        ) : null}
      </div>

      {state.message ? (
        <p role="alert" className="text-destructive text-sm">
          {state.message}
        </p>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Adding…" : "Add assignment"}
      </Button>
    </form>
  );
}
