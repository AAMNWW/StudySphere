"use client";

import { Sparkles } from "lucide-react";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";

import { generateJobCoverLetter } from "../actions";
import { initialAiActionFormState } from "../job-form-state";

export function CoverLetterButton({ jobId, hasResult }: { jobId: string; hasResult: boolean }) {
  const [, formAction, isPending] = useActionState(
    generateJobCoverLetter.bind(null, jobId),
    initialAiActionFormState,
  );

  return (
    <form action={formAction}>
      <Button type="submit" variant="outline" size="sm" disabled={isPending}>
        <Sparkles />
        {isPending ? "Writing…" : hasResult ? "Regenerate cover letter" : "Generate cover letter"}
      </Button>
    </form>
  );
}
