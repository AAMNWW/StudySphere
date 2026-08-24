"use client";

import { Sparkles } from "lucide-react";
import { useActionState } from "react";

import { CopyCoverLetterButton } from "@/app/career/jobs/_components/copy-cover-letter-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { generateStandaloneCoverLetter } from "../actions";
import { initialCoverLetterToolFormState } from "../cover-letter-form-state";

export function CoverLetterToolForm({ resumes }: { resumes: { id: string; title: string }[] }) {
  const [state, formAction, isPending] = useActionState(
    generateStandaloneCoverLetter,
    initialCoverLetterToolFormState,
  );

  return (
    <div className="space-y-6">
      <form key={state.submission} action={formAction} className="space-y-4" noValidate>
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

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              name="company"
              placeholder="Acme Inc."
              defaultValue={state.values?.company}
              maxLength={100}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Input
              id="role"
              name="role"
              placeholder="Software Engineer"
              defaultValue={state.values?.role}
              maxLength={100}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="jobDescription">Job description (optional)</Label>
          <Textarea
            id="jobDescription"
            name="jobDescription"
            placeholder="Paste the job posting for a more targeted letter."
            defaultValue={state.values?.jobDescription}
            maxLength={10000}
            rows={6}
          />
        </div>

        {state.message ? (
          <p role="alert" className="text-destructive text-sm">
            {state.message}
          </p>
        ) : null}

        <Button type="submit" disabled={isPending}>
          <Sparkles />
          {isPending ? "Drafting…" : "Generate cover letter"}
        </Button>
      </form>

      {state.coverLetter ? (
        <div className="space-y-2">
          <div className="bg-muted/40 rounded-xl border p-4 text-sm whitespace-pre-wrap">
            {state.coverLetter}
          </div>
          <CopyCoverLetterButton text={state.coverLetter} />
        </div>
      ) : null}
    </div>
  );
}
