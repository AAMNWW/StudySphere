"use client";

import { Pencil } from "lucide-react";
import { useActionState, useState } from "react";

import { GradeBadge } from "@/components/grade-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ExamModel } from "@/generated/prisma/models";
import { countdownLabel, daysUntil } from "@/lib/days-until";
import { cn } from "@/lib/utils";

import { updateExam } from "../actions";
import { initialExamFormState } from "../exam-form-state";
import { DeleteExamButton } from "./delete-exam-button";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeZone: "UTC",
});

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function ExamCard({
  courseId,
  exam,
}: {
  courseId: string;
  exam: ExamModel;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [state, formAction, isPending] = useActionState(
    updateExam.bind(null, courseId, exam.id),
    {
      ...initialExamFormState,
      values: {
        title: exam.title,
        examDate: toDateInputValue(exam.examDate),
        notes: exam.notes ?? "",
        earnedPoints: exam.earnedPoints?.toString() ?? "",
        maxPoints: exam.maxPoints?.toString() ?? "",
      },
    },
  );

  const [handledSubmission, setHandledSubmission] = useState(state.submission);
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
              <Label htmlFor={`exam-title-${exam.id}`}>Title</Label>
              <Input
                id={`exam-title-${exam.id}`}
                name="title"
                defaultValue={state.values?.title}
                maxLength={100}
                aria-invalid={Boolean(state.errors?.title)}
              />
              {state.errors?.title ? (
                <p className="text-destructive text-sm">{state.errors.title[0]}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor={`exam-date-${exam.id}`}>Exam date</Label>
              <Input
                id={`exam-date-${exam.id}`}
                name="examDate"
                type="date"
                defaultValue={state.values?.examDate}
                aria-invalid={Boolean(state.errors?.examDate)}
              />
              {state.errors?.examDate ? (
                <p className="text-destructive text-sm">{state.errors.examDate[0]}</p>
              ) : null}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor={`exam-earned-${exam.id}`}>Grade — earned (optional)</Label>
                <Input
                  id={`exam-earned-${exam.id}`}
                  name="earnedPoints"
                  type="number"
                  step="any"
                  min="0"
                  defaultValue={state.values?.earnedPoints}
                  aria-invalid={Boolean(state.errors?.earnedPoints)}
                />
                {state.errors?.earnedPoints ? (
                  <p className="text-destructive text-sm">{state.errors.earnedPoints[0]}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor={`exam-max-${exam.id}`}>Out of</Label>
                <Input
                  id={`exam-max-${exam.id}`}
                  name="maxPoints"
                  type="number"
                  step="any"
                  min="0"
                  defaultValue={state.values?.maxPoints}
                  aria-invalid={Boolean(state.errors?.maxPoints)}
                />
                {state.errors?.maxPoints ? (
                  <p className="text-destructive text-sm">{state.errors.maxPoints[0]}</p>
                ) : null}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`exam-notes-${exam.id}`}>Notes (optional)</Label>
              <Textarea
                id={`exam-notes-${exam.id}`}
                name="notes"
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

            <div className="flex gap-2">
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving…" : "Save"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  const days = daysUntil(exam.examDate);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle>{exam.title}</CardTitle>
              <span
                className={cn(
                  "inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[0.7rem] font-medium",
                  days < 0
                    ? "bg-muted text-muted-foreground"
                    : days <= 3
                      ? "bg-red-100 text-red-700"
                      : "bg-purple-100 text-purple-700",
                )}
              >
                {countdownLabel(days)}
              </span>
              <GradeBadge earnedPoints={exam.earnedPoints} maxPoints={exam.maxPoints} />
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              {dateFormatter.format(exam.examDate)}
            </p>
          </div>
        </div>
        <CardAction className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Edit ${exam.title}`}
            onClick={() => setIsEditing(true)}
          >
            <Pencil />
          </Button>
          <DeleteExamButton courseId={courseId} examId={exam.id} examTitle={exam.title} />
        </CardAction>
      </CardHeader>
      {exam.notes ? (
        <CardContent>
          <p className="text-sm whitespace-pre-wrap">{exam.notes}</p>
        </CardContent>
      ) : null}
    </Card>
  );
}
