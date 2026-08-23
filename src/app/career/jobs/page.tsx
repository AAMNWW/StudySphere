import { Briefcase } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { IconTile } from "@/components/icon-tile";
import { JOB_STATUS_OPTIONS, JobStatusBadge } from "@/components/job-status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/db";

import { JobApplicationForm } from "./_components/job-application-form";
import { createJobApplication } from "./actions";

export const metadata: Metadata = {
  title: "Job Tracker",
};

export default async function JobsPage() {
  const userId = await requireUserId();

  const [jobs, resumes] = await Promise.all([
    db.jobApplication.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    }),
    db.resume.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true },
    }),
  ]);

  const jobsByStatus = new Map(JOB_STATUS_OPTIONS.map(({ value }) => [value, jobs.filter((job) => job.status === value)]));

  return (
    <main className="max-w-2xl">
      <header className="mb-8 flex items-center gap-3">
        <IconTile color="purple">
          <Briefcase className="size-5" />
        </IconTile>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Job Tracker</h1>
          <p className="text-muted-foreground text-sm">
            Every job you&apos;re tracking, from saved to offer.
          </p>
        </div>
      </header>

      <Card className="mb-10">
        <CardHeader>
          <CardTitle>Add a job</CardTitle>
        </CardHeader>
        <CardContent>
          <JobApplicationForm
            action={createJobApplication}
            resumes={resumes}
            submitLabel="Add job"
            pendingLabel="Adding…"
          />
        </CardContent>
      </Card>

      {jobs.length === 0 ? (
        <p className="text-muted-foreground rounded-2xl border border-dashed p-8 text-center text-sm">
          No jobs tracked yet. Add your first one above.
        </p>
      ) : (
        <div className="space-y-8">
          {JOB_STATUS_OPTIONS.map(({ value, label }) => {
            const group = jobsByStatus.get(value) ?? [];

            if (group.length === 0) {
              return null;
            }

            return (
              <section key={value} aria-labelledby={`status-${value}-heading`}>
                <h2 id={`status-${value}-heading`} className="mb-3 text-sm font-bold">
                  {label} ({group.length})
                </h2>
                <ul className="space-y-2">
                  {group.map((job) => (
                    <li key={job.id}>
                      <Link href={`/career/jobs/${job.id}`} className="block">
                        <Card className="transition-colors hover:bg-muted/50">
                          <CardContent className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">{job.role}</p>
                              <p className="text-muted-foreground truncate text-xs">
                                {job.company}
                              </p>
                            </div>
                            <JobStatusBadge status={job.status} />
                          </CardContent>
                        </Card>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
}
