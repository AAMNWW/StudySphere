import { Wand2 } from "lucide-react";
import type { Metadata } from "next";

import { IconTile } from "@/components/icon-tile";
import { requireUserId } from "@/lib/auth";

import { ResumeMakerForm } from "./_components/resume-maker-form";

export const metadata: Metadata = {
  title: "Resume Maker",
};

export default async function ResumeMakerPage() {
  await requireUserId();

  return (
    <main className="max-w-2xl">
      <header className="mb-8 flex items-center gap-3">
        <IconTile color="yellow">
          <Wand2 className="size-5" />
        </IconTile>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Resume Maker</h1>
          <p className="text-muted-foreground text-sm">
            Build a resume from scratch — let AI draft it from loose notes, then fine-tune every
            field before saving it as a real resume you can attach to jobs.
          </p>
        </div>
      </header>

      <ResumeMakerForm />
    </main>
  );
}
