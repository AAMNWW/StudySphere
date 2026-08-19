"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { createTopic } from "../actions";
import { initialTopicFormState } from "../topic-form-state";

export function CreateTopicForm({ courseId }: { courseId: string }) {
  const [state, formAction, isPending] = useActionState(
    createTopic.bind(null, courseId),
    initialTopicFormState,
  );

  return (
    <form key={state.submission} action={formAction} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="topic-title">Title</Label>
        <Input
          id="topic-title"
          name="title"
          placeholder="Cellular respiration"
          defaultValue={state.values?.title}
          maxLength={150}
          aria-invalid={Boolean(state.errors?.title)}
        />
        {state.errors?.title ? (
          <p className="text-destructive text-sm">{state.errors.title[0]}</p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        <div className="space-y-2">
          <Label htmlFor="topic-description">Description (optional)</Label>
          <Textarea
            id="topic-description"
            name="description"
            placeholder="What to focus on and why it matters."
            defaultValue={state.values?.description}
            maxLength={1000}
            rows={2}
            aria-invalid={Boolean(state.errors?.description)}
          />
          {state.errors?.description ? (
            <p className="text-destructive text-sm">{state.errors.description[0]}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="topic-week">Week (optional)</Label>
          <Input
            id="topic-week"
            name="weekNumber"
            type="number"
            min={1}
            placeholder="1"
            defaultValue={state.values?.weekNumber}
            className="w-20"
            aria-invalid={Boolean(state.errors?.weekNumber)}
          />
          {state.errors?.weekNumber ? (
            <p className="text-destructive text-sm">{state.errors.weekNumber[0]}</p>
          ) : null}
        </div>
      </div>

      {state.message ? (
        <p role="alert" className="text-destructive text-sm">
          {state.message}
        </p>
      ) : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Adding…" : "Add topic"}
      </Button>
    </form>
  );
}
