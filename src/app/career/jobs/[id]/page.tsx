import { Briefcase } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BackLink } from "@/components/back-link";
import { IconTile } from "@/components/icon-tile";
import { JobStatusBadge } from "@/components/job-status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/db";

import { AtsCheckCard } from "../_components/ats-check-card";
import { CoverLetterCard } from "../_components/cover-letter-card";
import { DeleteJobApplicationButton } from "../_components/delete-job-application-button";
import { JobApplicationForm } from "../_components/job-application-form";
import { updateJobApplication } from "../actions";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeZone: "UTC",
});

export async function generateMetadata({
  params,
}: PageProps<"/career/jobs/[id]">): Promise<Metadata> {
  const userId = await requireUserId();
  const { id } = await params;
  const job = await db.jobApplication.findFirst({
    where: { id, userId },
    select: { company: true, role: true },
  });

  return { title: job ? `${job.role} — ${job.company}` : "Job not found" };
}

export default async function JobApplicationPage({
  params,
}: PageProps<"/career/jobs/[id]">) {
  const userId = await requireUserId();
  const { id: jobId } = await params;

  const [job, resumes] = await Promise.all([
    db.jobApplication.findFirst({ where: { id: jobId, userId } }),
    db.resume.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true },
    }),
  ]);

  if (!job) {
    notFound();
  }

  return (
    <main className="max-w-2xl">
      <BackLink href="/career/jobs">Back to Job Tracker</BackLink>

      <header className="mt-4 mb-8 flex items-center gap-3">
        <IconTile color="purple">
          <Briefcase className="size-5" />
        </IconTile>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">{job.role}</h1>
            <JobStatusBadge status={job.status} />
          </div>
          <p className="text-muted-foreground text-sm">
            {job.company}
            {job.appliedAt ? ` · Applied ${dateFormatter.format(job.appliedAt)}` : ""}
          </p>
        </div>
      </header>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent>
          <JobApplicationForm
            action={updateJobApplication.bind(null, job.id)}
            initialValues={{
              company: job.company,
              role: job.role,
              status: job.status,
              jobUrl: job.jobUrl ?? "",
              jobDescription: job.jobDescription ?? "",
              notes: job.notes ?? "",
              resumeId: job.resumeId ?? "",
            }}
            resumes={resumes}
            submitLabel="Save changes"
            pendingLabel="Saving…"
          />
        </CardContent>
      </Card>

      <AtsCheckCard
        jobId={job.id}
        atsScore={job.atsScore}
        atsFeedback={job.atsFeedback}
        atsMatchedKeywords={job.atsMatchedKeywords}
        atsMissingKeywords={job.atsMissingKeywords}
        atsError={job.atsError}
      />

      <CoverLetterCard
        jobId={job.id}
        coverLetter={job.coverLetter}
        coverLetterError={job.coverLetterError}
      />

      <Card>
        <CardHeader>
          <CardTitle>Delete job</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm">
            Permanently removes this job from your tracker. This cannot be undone.
          </p>
          <DeleteJobApplicationButton jobId={job.id} jobLabel={`${job.role} at ${job.company}`} />
        </CardContent>
      </Card>
    </main>
  );
}
