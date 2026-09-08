"use client";

import { Sparkles } from "lucide-react";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";

import { runAtsCheck } from "../actions";
import { initialAiActionFormState } from "../job-form-state";

export function AtsCheckButton({ jobId, hasResult }: { jobId: string; hasResult: boolean }) {
  // The result/error is persisted on the job and rendered by the page, so
  // this state only drives the pending label.
  const [, formAction, isPending] = useActionState(
    runAtsCheck.bind(null, jobId),
    initialAiActionFormState,
  );

  return (
    <form action={formAction}>
      <Button type="submit" variant="outline" size="sm" disabled={isPending}>
        <Sparkles />
        {isPending ? "Checking…" : hasResult ? "Re-run ATS check" : "Run ATS check"}
      </Button>
    </form>
  );
}
