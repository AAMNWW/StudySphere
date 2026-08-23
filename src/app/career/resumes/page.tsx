import { FileText } from "lucide-react";
import type { Metadata } from "next";

import { IconTile } from "@/components/icon-tile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/db";

import { ResumeRow } from "./_components/resume-row";
import { UploadResumeForm } from "./_components/upload-resume-form";

export const metadata: Metadata = {
  title: "Resumes",
};

export default async function ResumesPage() {
  const userId = await requireUserId();

  const resumes = await db.resume.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="max-w-2xl">
      <header className="mb-8 flex items-center gap-3">
        <IconTile color="blue">
          <FileText className="size-5" />
        </IconTile>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Resumes</h1>
          <p className="text-muted-foreground text-sm">
            Keep one resume per role type, and attach the right one to each job you track.
          </p>
        </div>
      </header>

      <Card className="mb-10">
        <CardHeader>
          <CardTitle>Upload a resume</CardTitle>
        </CardHeader>
        <CardContent>
          <UploadResumeForm />
        </CardContent>
      </Card>

      <section aria-labelledby="resume-list-heading">
        <h2 id="resume-list-heading" className="mb-4 text-lg font-bold">
          {resumes.length} {resumes.length === 1 ? "resume" : "resumes"}
        </h2>

        {resumes.length === 0 ? (
          <p className="text-muted-foreground rounded-2xl border border-dashed p-8 text-center text-sm">
            No resumes yet. Upload your first one above.
          </p>
        ) : (
          <ul className="space-y-3">
            {resumes.map((resume) => (
              <li key={resume.id}>
                <ResumeRow resume={resume} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
