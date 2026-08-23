"use client";

import { Pencil } from "lucide-react";
import { useActionState, useState, useTransition } from "react";

import { PriorityBadge } from "@/components/priority-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { AssignmentModel } from "@/generated/prisma/models";
import { cn } from "@/lib/utils";

import { setAssignmentCompleted, updateAssignment } from "../actions";
import { initialAssignmentFormState } from "../assignment-form-state";
import { AssignmentAiHelpButton } from "./assignment-ai-help-button";
import { DeleteAssignmentButton } from "./delete-assignment-button";
import { PriorityPicker } from "./priority-picker";

// Fixed locale and time zone so the server always renders the same string a
// user would see, regardless of where the server happens to run.
const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeZone: "UTC",
});

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function AssignmentCard({
  courseId,
  assignment,
  isOverdue,
}: {
  courseId: string;
  assignment: AssignmentModel;
  /**
   * Computed by the server, which knows the current time deterministically
   * for this render; `Date.now()` may not be called during a component's
   * render (https://react.dev/reference/rules/components-and-hooks-must-be-pure).
   */
  isOverdue: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isTogglePending, startToggleTransition] = useTransition();
  const [state, formAction, isSavePending] = useActionState(
    updateAssignment.bind(null, courseId, assignment.id),
    {
      ...initialAssignmentFormState,
      values: {
        title: assignment.title,
        description: assignment.description ?? "",
        dueDate: assignment.dueDate
          ? toDateInputValue(assignment.dueDate)
          : "",
        priority: assignment.priority,
      },
    },
  );

  // Drop back into the read view once a save succeeds, rather than making
  // the user close the form themselves. Adjusting state during render (per
  // https://react.dev/learn/you-might-not-need-an-effect) instead of an
  // effect avoids an extra render pass.
  const [handledSubmission, setHandledSubmission] = useState(
    state.submission,
  );
  if (
    isEditing &&
    state.status === "success" &&
    state.submission !== handledSubmission
  ) {
    setHandledSubmission(state.submission);
    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <Card>
        <CardContent>
          <form
            key={state.submission}
            action={formAction}
            className="space-y-4"
            noValidate
          >
            <div className="space-y-2">
              <Label htmlFor={`assignment-title-${assignment.id}`}>
                Title
              </Label>
              <Input
                id={`assignment-title-${assignment.id}`}
                name="title"
                defaultValue={state.values?.title}
                maxLength={100}
                aria-invalid={Boolean(state.errors?.title)}
              />
              {state.errors?.title ? (
                <p className="text-destructive text-sm">
                  {state.errors.title[0]}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor={`assignment-due-date-${assignment.id}`}>
                Due date (optional)
              </Label>
              <Input
                id={`assignment-due-date-${assignment.id}`}
                name="dueDate"
                type="date"
                defaultValue={state.values?.dueDate}
                aria-invalid={Boolean(state.errors?.dueDate)}
              />
              {state.errors?.dueDate ? (
                <p className="text-destructive text-sm">
                  {state.errors.dueDate[0]}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <PriorityPicker defaultValue={state.values?.priority} />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`assignment-description-${assignment.id}`}>
                Description (optional)
              </Label>
              <Textarea
                id={`assignment-description-${assignment.id}`}
                name="description"
                defaultValue={state.values?.description}
                maxLength={2000}
                rows={3}
                aria-invalid={Boolean(state.errors?.description)}
              />
              {state.errors?.description ? (
                <p className="text-destructive text-sm">
                  {state.errors.description[0]}
                </p>
              ) : null}
            </div>

            {state.message ? (
              <p role="alert" className="text-destructive text-sm">
                {state.message}
              </p>
            ) : null}

            <div className="flex gap-2">
              <Button type="submit" disabled={isSavePending}>
                {isSavePending ? "Saving…" : "Save"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          <Checkbox
            checked={assignment.completed}
            disabled={isTogglePending}
            onCheckedChange={(completed) => {
              startToggleTransition(() => {
                setAssignmentCompleted(courseId, assignment.id, completed);
              });
            }}
            aria-label={
              assignment.completed
                ? `Mark ${assignment.title} as not done`
                : `Mark ${assignment.title} as done`
            }
            className="mt-1"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle
                className={cn(assignment.completed && "text-muted-foreground line-through")}
              >
                {assignment.title}
              </CardTitle>
              <PriorityBadge priority={assignment.priority} hideMedium />
            </div>
            {assignment.dueDate ? (
              <p
                className={cn(
                  "mt-1 text-xs",
                  isOverdue ? "text-destructive" : "text-muted-foreground",
                )}
              >
                Due {dateFormatter.format(assignment.dueDate)}
                {isOverdue ? " (overdue)" : ""}
              </p>
            ) : null}
          </div>
        </div>
        <CardAction className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Edit ${assignment.title}`}
            onClick={() => setIsEditing(true)}
          >
            <Pencil />
          </Button>
          <DeleteAssignmentButton
            courseId={courseId}
            assignmentId={assignment.id}
            assignmentTitle={assignment.title}
          />
        </CardAction>
      </CardHeader>
      {assignment.description || assignment.aiHelp || assignment.aiHelpError || !assignment.completed ? (
        <CardContent className="space-y-3">
          {assignment.description ? (
            <p className="text-sm whitespace-pre-wrap">
              {assignment.description}
            </p>
          ) : null}

          {assignment.aiHelp ? (
            <p className="text-muted-foreground border-l-2 pl-3 text-sm whitespace-pre-wrap">
              {assignment.aiHelp}
            </p>
          ) : null}

          {assignment.aiHelpError ? (
            <p role="alert" className="text-destructive text-xs">
              {assignment.aiHelpError}
            </p>
          ) : null}

          {!assignment.completed ? (
            <AssignmentAiHelpButton
              courseId={courseId}
              assignmentId={assignment.id}
              hasHelp={Boolean(assignment.aiHelp)}
            />
          ) : null}
        </CardContent>
      ) : null}
    </Card>
  );
}
