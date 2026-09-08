"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CourseModel } from "@/generated/prisma/models";

import { updateCourse } from "../../actions";
import { initialCourseFormState } from "../../course-form-state";

export function EditCourseForm({ course }: { course: CourseModel }) {
  const [state, formAction, isPending] = useActionState(
    updateCourse.bind(null, course.id),
    {
      ...initialCourseFormState,
      values: {
        title: course.title,
        description: course.description ?? "",
      },
    },
  );

  return (
    <form
      // Remounting on each submission lets the inputs pick up `defaultValue`
      // again after a validation error.
      key={state.submission}
      action={formAction}
      className="space-y-4"
      noValidate
    >
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          placeholder="Linear Algebra"
          defaultValue={state.values?.title}
          maxLength={100}
          aria-invalid={Boolean(state.errors?.title)}
          aria-describedby={state.errors?.title ? "title-error" : undefined}
        />
        {state.errors?.title ? (
          <p id="title-error" className="text-destructive text-sm">
            {state.errors.title[0]}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="What this course covers, and what you want to get out of it."
          defaultValue={state.values?.description}
          maxLength={500}
          rows={3}
          aria-invalid={Boolean(state.errors?.description)}
          aria-describedby={
            state.errors?.description ? "description-error" : undefined
          }
        />
        {state.errors?.description ? (
          <p id="description-error" className="text-destructive text-sm">
            {state.errors.description[0]}
          </p>
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
        {isPending ? "Saving…" : "Save changes"}
      </Button>
    </form>
  );
}
