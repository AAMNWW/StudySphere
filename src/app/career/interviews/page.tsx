import { Mic } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { IconTile } from "@/components/icon-tile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/db";

import { DeleteInterviewButton } from "./_components/delete-interview-button";
import { NewInterviewForm } from "./_components/new-interview-form";

export const metadata: Metadata = {
  title: "Mock Interviews",
};

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

export default async function InterviewsHubPage() {
  const userId = await requireUserId();

  const [resumes, sessions] = await Promise.all([
    db.resume.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true },
    }),
    db.interviewSession.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  return (
    <main className="max-w-2xl">
      <header className="mb-8 flex items-center gap-3">
        <IconTile color="red">
          <Mic className="size-5" />
        </IconTile>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mock Interviews</h1>
          <p className="text-muted-foreground text-sm">
            Practice with an AI interviewer, one question at a time, then get wrap-up feedback.
          </p>
        </div>
      </header>

      <Card className="mb-10">
        <CardHeader>
          <CardTitle>New interview</CardTitle>
        </CardHeader>
        <CardContent>
          <NewInterviewForm resumes={resumes} />
        </CardContent>
      </Card>

      <section aria-labelledby="interview-list-heading">
        <h2 id="interview-list-heading" className="mb-4 text-lg font-bold">
          {sessions.length} past {sessions.length === 1 ? "interview" : "interviews"}
        </h2>

        {sessions.length === 0 ? (
          <p className="text-muted-foreground rounded-2xl border border-dashed p-8 text-center text-sm">
            No mock interviews yet. Start your first one above.
          </p>
        ) : (
          <ul className="space-y-3">
            {sessions.map((session) => (
              <li key={session.id}>
                <Card className="transition-colors hover:bg-muted/50">
                  <CardHeader>
                    <div className="flex items-center justify-between gap-2">
                      <Link href={`/career/interviews/${session.id}`} className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <CardTitle className="text-base">
                            {session.role}
                            {session.company ? ` — ${session.company}` : ""}
                          </CardTitle>
                          <span
                            className={
                              session.status === "COMPLETED"
                                ? "rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700"
                                : "rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700"
                            }
                          >
                            {session.status === "COMPLETED" ? "Completed" : "In progress"}
                          </span>
                        </div>
                        <p className="text-muted-foreground mt-1 text-sm">
                          Updated {dateFormatter.format(session.updatedAt)}
                        </p>
                      </Link>
                      <DeleteInterviewButton
                        sessionId={session.id}
                        sessionLabel={`${session.role}${session.company ? ` at ${session.company}` : ""}`}
                      />
                    </div>
                  </CardHeader>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
