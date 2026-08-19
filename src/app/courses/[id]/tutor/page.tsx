import { Sparkles } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { IconTile } from "@/components/icon-tile";
import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/db";

import { ChatPanel } from "../_components/chat-panel";
import { sendTutorMessage } from "./actions";

export async function generateMetadata({
  params,
}: PageProps<"/courses/[id]/tutor">): Promise<Metadata> {
  const userId = await requireUserId();
  const { id } = await params;
  const course = await db.course.findFirst({
    where: { id, userId },
    select: { title: true },
  });

  return { title: course ? `AI tutor — ${course.title}` : "Course not found" };
}

export default async function TutorPage({
  params,
}: PageProps<"/courses/[id]/tutor">) {
  const userId = await requireUserId();
  const { id: courseId } = await params;

  const course = await db.course.findFirst({ where: { id: courseId, userId } });

  if (!course) {
    notFound();
  }

  const thread = await db.chatThread.findFirst({
    where: { courseId, documentId: null },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <Link
        href={`/courses/${courseId}`}
        className="text-muted-foreground text-sm hover:underline"
      >
        ← Back to {course.title}
      </Link>

      <header className="mt-4 mb-8 flex items-center gap-3">
        <IconTile color="pink">
          <Sparkles className="size-5" />
        </IconTile>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI tutor</h1>
          <p className="text-muted-foreground text-sm">
            Ask general study questions about {course.title}.
          </p>
        </div>
      </header>

      <ChatPanel
        messages={thread?.messages ?? []}
        action={sendTutorMessage.bind(null, courseId)}
        emptyHint={`Ask a question about ${course.title} — explain a concept, work through a problem, whatever helps.`}
      />
    </main>
  );
}
