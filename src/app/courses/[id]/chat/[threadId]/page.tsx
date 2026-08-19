import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/db";

import { ChatPanel } from "../../_components/chat-panel";
import { sendChatMessage } from "../actions";

export async function generateMetadata({
  params,
}: PageProps<"/courses/[id]/chat/[threadId]">): Promise<Metadata> {
  const userId = await requireUserId();
  const { id, threadId } = await params;
  const thread = await db.chatThread.findFirst({
    where: { id: threadId, courseId: id, course: { userId } },
    select: { title: true },
  });

  return { title: thread?.title ?? "Chat not found" };
}

export default async function ChatThreadPage({
  params,
}: PageProps<"/courses/[id]/chat/[threadId]">) {
  const userId = await requireUserId();
  const { id: courseId, threadId } = await params;

  const thread = await db.chatThread.findFirst({
    where: { id: threadId, courseId, course: { userId } },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  if (!thread) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <Link
        href={`/courses/${courseId}/chat`}
        className="text-muted-foreground text-sm hover:underline"
      >
        ← Back to chats
      </Link>
      <h1 className="mt-4 mb-8 text-2xl font-bold tracking-tight">{thread.title}</h1>

      <ChatPanel
        messages={thread.messages}
        action={sendChatMessage.bind(null, courseId, thread.id)}
        emptyHint="Ask your first question to get started."
      />
    </main>
  );
}
