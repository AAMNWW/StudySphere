import { Target } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { IconTile } from "@/components/icon-tile";
import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/db";

import { AtsCheckToolForm } from "./_components/ats-check-tool-form";

export const metadata: Metadata = {
  title: "ATS Check",
};

export default async function AtsCheckPage() {
  const userId = await requireUserId();

  const resumes = await db.resume.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true },
  });

  return (
    <main className="max-w-2xl">
      <header className="mb-8 flex items-center gap-3">
        <IconTile color="green">
          <Target className="size-5" />
        </IconTile>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">ATS Check</h1>
          <p className="text-muted-foreground text-sm">
            Simulate how an Applicant Tracking System would score any of your resumes against a
            job description.
          </p>
        </div>
      </header>

      {resumes.length === 0 ? (
        <p className="text-muted-foreground rounded-2xl border border-dashed p-8 text-center text-sm">
          You need a resume first.{" "}
          <Link href="/career/resumes" className="text-foreground underline underline-offset-2">
            Upload one
          </Link>{" "}
          to run an ATS check.
        </p>
      ) : (
        <AtsCheckToolForm resumes={resumes} />
      )}
    </main>
  );
}
