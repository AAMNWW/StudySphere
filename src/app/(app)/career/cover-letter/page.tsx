import { Mail } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { IconTile } from "@/components/icon-tile";
import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/db";

import { CoverLetterToolForm } from "./_components/cover-letter-tool-form";

export const metadata: Metadata = {
  title: "Cover Letter",
};

export default async function CoverLetterPage() {
  const userId = await requireUserId();

  const resumes = await db.resume.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true },
  });

  return (
    <main className="max-w-2xl">
      <header className="mb-8 flex items-center gap-3">
        <IconTile color="pink">
          <Mail className="size-5" />
        </IconTile>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cover Letter</h1>
          <p className="text-muted-foreground text-sm">
            Draft a cover letter from any of your resumes for a specific role — review it before
            sending, it won&apos;t invent experience you don&apos;t have.
          </p>
        </div>
      </header>

      {resumes.length === 0 ? (
        <p className="text-muted-foreground rounded-2xl border border-dashed p-8 text-center text-sm">
          You need a resume first.{" "}
          <Link href="/career/resumes" className="text-foreground underline underline-offset-2">
            Upload one
          </Link>{" "}
          to draft a cover letter.
        </p>
      ) : (
        <CoverLetterToolForm resumes={resumes} />
      )}
    </main>
  );
}
