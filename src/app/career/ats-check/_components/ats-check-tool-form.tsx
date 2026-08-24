"use client";

import { Sparkles } from "lucide-react";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import { runStandaloneAtsCheck } from "../actions";
import { initialAtsCheckToolFormState } from "../ats-check-form-state";

function scoreColorClasses(score: number): string {
  if (score >= 80) return "text-emerald-600";
  if (score >= 50) return "text-amber-600";
  return "text-destructive";
}

export function AtsCheckToolForm({ resumes }: { resumes: { id: string; title: string }[] }) {
  const [state, formAction, isPending] = useActionState(
    runStandaloneAtsCheck,
    initialAtsCheckToolFormState,
  );

  return (
    <div className="space-y-6">
      <form
        // Remounting on each submission lets the inputs pick up
        // defaultValue again after a validation error, matching the rest
        // of the career forms.
        key={state.submission}
        action={formAction}
        className="space-y-4"
        noValidate
      >
        <div className="space-y-2">
          <Label htmlFor="resumeId">Resume</Label>
          <select
            id="resumeId"
            name="resumeId"
            defaultValue={state.values?.resumeId ?? ""}
            className="border-input focus-visible:border-ring focus-visible:ring-ring/50 h-8 w-full rounded-lg border bg-transparent px-2.5 text-sm outline-none focus-visible:ring-3"
          >
            <option value="">Choose a resume…</option>
            {resumes.map((resume) => (
              <option key={resume.id} value={resume.id}>
                {resume.title}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="jobDescription">Job description</Label>
          <Textarea
            id="jobDescription"
            name="jobDescription"
            placeholder="Paste the job posting here."
            defaultValue={state.values?.jobDescription}
            maxLength={10000}
            rows={8}
          />
        </div>

        {state.message ? (
          <p role="alert" className="text-destructive text-sm">
            {state.message}
          </p>
        ) : null}

        <Button type="submit" disabled={isPending}>
          <Sparkles />
          {isPending ? "Checking…" : "Run ATS check"}
        </Button>
      </form>

      {state.result ? (
        <div className="space-y-3 rounded-2xl border p-4">
          <p className={cn("text-3xl font-bold tabular-nums", scoreColorClasses(state.result.score))}>
            {state.result.score}%
          </p>
          {state.result.feedback ? <p className="text-sm">{state.result.feedback}</p> : null}

          {state.result.matchedKeywords.length > 0 ? (
            <div>
              <p className="mb-1.5 text-xs font-medium">Matched keywords</p>
              <div className="flex flex-wrap gap-1.5">
                {state.result.matchedKeywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {state.result.missingKeywords.length > 0 ? (
            <div>
              <p className="mb-1.5 text-xs font-medium">Missing keywords</p>
              <div className="flex flex-wrap gap-1.5">
                {state.result.missingKeywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="bg-destructive/10 text-destructive rounded-full px-2 py-0.5 text-xs font-medium"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
