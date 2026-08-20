"use client";

import { Sparkles } from "lucide-react";
import { useActionState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

import { generateStudyPlanAction } from "../actions";
import { initialStudyPlanFormState } from "../study-plan-form-state";

export function GeneratePlanButton({ courseId }: { courseId: string }) {
  const [state, formAction, isPending] = useActionState(
    generateStudyPlanAction.bind(null, courseId),
    initialStudyPlanFormState,
  );

  return (
    <div className="space-y-4">
      <form action={formAction}>
        <Button type="submit" disabled={isPending}>
          <Sparkles />
          {isPending ? "Thinking…" : "Generate my study plan"}
        </Button>
      </form>

      {state.status === "error" && state.message ? (
        <p role="alert" className="text-destructive text-sm">
          {state.message}
        </p>
      ) : null}

      {state.status === "success" && state.plan ? (
        <div className="bg-card space-y-3 rounded-2xl border border-black/5 p-4 shadow-sm">
          <p className="text-sm whitespace-pre-wrap">{state.plan}</p>
          <Link
            href={`/courses/${courseId}/topics`}
            className="text-sm underline underline-offset-2"
          >
            View the added topics →
          </Link>
        </div>
      ) : null}
    </div>
  );
}
