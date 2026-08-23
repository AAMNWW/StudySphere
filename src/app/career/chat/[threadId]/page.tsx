import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BackLink } from "@/components/back-link";
import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/db";

import { ChatPanel } from "@/components/chat-panel";

export async function generateMetadata({
  params,
}: PageProps<"/career/chat/[threadId]">): Promise<Metadata> {
  const userId = await requireUserId();
  const { threadId } = await params;
  const thread = await db.careerChatThread.findFirst({
    where: { id: threadId, userId },
    select: { title: true },
  });

  return { title: thread?.title ?? "Chat not found" };
}

export default async function CareerChatThreadPage({
  params,
}: PageProps<"/career/chat/[threadId]">) {
  const userId = await requireUserId();
  const { threadId } = await params;

  const thread = await db.careerChatThread.findFirst({
    where: { id: threadId, userId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  if (!thread) {
    notFound();
  }

  return (
    <main className="max-w-3xl">
      <BackLink href="/career/chat">Back to chats</BackLink>
      <h1 className="mt-4 mb-8 text-2xl font-bold tracking-tight">{thread.title}</h1>

      <ChatPanel
        endpoint={`/api/career/chat/${thread.id}/message`}
        messages={thread.messages}
        emptyHint="Ask your first question to get started."
      />
    </main>
  );
}
