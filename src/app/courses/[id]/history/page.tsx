import { History } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { IconTile } from "@/components/icon-tile";
import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";

const DIFFICULTY_LABELS: Record<string, string> = {
  EASY: "Easy",
  MEDIUM: "Medium",
  HARD: "Hard",
  PRO: "Pro",
  MASTER: "Master",
};

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

export async function generateMetadata({
  params,
}: PageProps<"/courses/[id]/history">): Promise<Metadata> {
  const userId = await requireUserId();
  const { id } = await params;
  const course = await db.course.findFirst({ where: { id, userId }, select: { title: true } });

  return { title: course ? `Wrong-answer history — ${course.title}` : "Course not found" };
}

export default async function HistoryPage({
  params,
  searchParams,
}: PageProps<"/courses/[id]/history">) {
  const userId = await requireUserId();
  const { id: courseId } = await params;
  const { wrong } = await searchParams;
  const wrongOnly = wrong !== "0";

  const course = await db.course.findFirst({ where: { id: courseId, userId } });

  if (!course) {
    notFound();
  }

  const logs = await db.quizAnswerLog.findMany({
    where: { courseId, userId, ...(wrongOnly ? { isCorrect: false } : {}) },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <main className="max-w-2xl">
      <header className="mb-8 flex items-center gap-3">
        <IconTile color="red">
          <History className="size-5" />
        </IconTile>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Wrong-answer history</h1>
          <p className="text-muted-foreground text-sm">
            Every quiz question you&apos;ve gotten wrong in {course.title}, across all past
            attempts.
          </p>
        </div>
      </header>

      <div className="mb-6 flex gap-2 text-sm">
        <Link
          href={`/courses/${courseId}/history?wrong=1`}
          className={cn(
            "rounded-full border px-3 py-1",
            wrongOnly ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted",
          )}
        >
          Wrong only
        </Link>
        <Link
          href={`/courses/${courseId}/history?wrong=0`}
          className={cn(
            "rounded-full border px-3 py-1",
            !wrongOnly ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted",
          )}
        >
          All answers
        </Link>
      </div>

      {logs.length === 0 ? (
        <p className="text-muted-foreground rounded-2xl border border-dashed p-8 text-center text-sm">
          {wrongOnly
            ? "No wrong answers yet — nice work."
            : "No quiz answers recorded yet."}
        </p>
      ) : (
        <ul className="space-y-3">
          {logs.map((log) => {
            const options = log.options as string[];

            return (
              <li
                key={log.id}
                className="bg-card rounded-2xl border border-black/5 p-4 shadow-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{log.question}</p>
                  <span className="text-muted-foreground shrink-0 text-xs">
                    {dateFormatter.format(log.createdAt)}
                  </span>
                </div>
                <div className="mt-2 space-y-1 text-sm">
                  <p className={cn(log.isCorrect ? "text-emerald-700" : "text-red-700")}>
                    Your answer: {options[log.selectedIndex]}
                  </p>
                  {!log.isCorrect ? (
                    <p className="text-muted-foreground">
                      Correct answer: {options[log.correctIndex]}
                    </p>
                  ) : null}
                </div>
                <p className="text-muted-foreground mt-2 text-xs">
                  {DIFFICULTY_LABELS[log.difficulty]}
                  {log.topic ? ` · ${log.topic}` : ""}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
