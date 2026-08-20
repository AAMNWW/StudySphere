import { Sparkles } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { IconTile } from "@/components/icon-tile";
import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/db";

import { GeneratePlanButton } from "./_components/generate-plan-button";

export async function generateMetadata({
  params,
}: PageProps<"/courses/[id]/planner">): Promise<Metadata> {
  const userId = await requireUserId();
  const { id } = await params;
  const course = await db.course.findFirst({ where: { id, userId }, select: { title: true } });

  return { title: course ? `Study planner — ${course.title}` : "Course not found" };
}

export default async function PlannerPage({ params }: PageProps<"/courses/[id]/planner">) {
  const userId = await requireUserId();
  const { id: courseId } = await params;

  const course = await db.course.findFirst({ where: { id: courseId, userId } });

  if (!course) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-12">
      <Link
        href={`/courses/${courseId}`}
        className="text-muted-foreground text-sm hover:underline"
      >
        ← Back to {course.title}
      </Link>

      <header className="mt-4 mb-8 flex items-center gap-3">
        <IconTile color="gray">
          <Sparkles className="size-5" />
        </IconTile>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Study planner</h1>
          <p className="text-muted-foreground text-sm">
            An agent checks what&apos;s due and what you&apos;ve been getting
            wrong in {course.title}, then adds targeted topics to your
            weekly plan.
          </p>
        </div>
      </header>

      <GeneratePlanButton courseId={courseId} />
    </main>
  );
}
