import { MessageCircle } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { IconTile } from "@/components/icon-tile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/db";

import { NewChatForm } from "./_components/new-chat-form";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

export async function generateMetadata({
  params,
}: PageProps<"/courses/[id]/chat">): Promise<Metadata> {
  const userId = await requireUserId();
  const { id } = await params;
  const course = await db.course.findFirst({ where: { id, userId }, select: { title: true } });

  return { title: course ? `Chat — ${course.title}` : "Course not found" };
}

export default async function ChatHubPage({
  params,
  searchParams,
}: PageProps<"/courses/[id]/chat">) {
  const userId = await requireUserId();
  const { id: courseId } = await params;
  const { documentIds } = await searchParams;
  const defaultDocumentIds =
    typeof documentIds === "string" ? [documentIds] : documentIds;

  const course = await db.course.findFirst({ where: { id: courseId, userId } });

  if (!course) {
    notFound();
  }

  const [documents, threads] = await Promise.all([
    db.document.findMany({
      where: { courseId },
      orderBy: { createdAt: "desc" },
      select: { id: true, fileName: true },
    }),
    db.chatThread.findMany({
      where: { courseId },
      orderBy: { updatedAt: "desc" },
      include: { messages: { orderBy: { createdAt: "desc" }, take: 1 } },
    }),
  ]);

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-12">
      <Link
        href={`/courses/${courseId}`}
        className="text-muted-foreground text-sm hover:underline"
      >
        ← Back to {course.title}
      </Link>

      <header className="mt-4 mb-8 flex items-center gap-3">
        <IconTile color="pink">
          <MessageCircle className="size-5" />
        </IconTile>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Chat</h1>
          <p className="text-muted-foreground text-sm">
            Chat generally about this course, or ground it in specific documents or a topic.
          </p>
        </div>
      </header>

      <Card className="mb-10">
        <CardHeader>
          <CardTitle>New chat</CardTitle>
        </CardHeader>
        <CardContent>
          <NewChatForm
            courseId={courseId}
            documents={documents}
            defaultDocumentIds={defaultDocumentIds}
          />
        </CardContent>
      </Card>

      <section aria-labelledby="chat-list-heading">
        <h2 id="chat-list-heading" className="mb-4 text-lg font-bold">
          {threads.length} past {threads.length === 1 ? "chat" : "chats"}
        </h2>

        {threads.length === 0 ? (
          <p className="text-muted-foreground rounded-2xl border border-dashed p-8 text-center text-sm">
            No chats yet. Start your first one above.
          </p>
        ) : (
          <ul className="space-y-3">
            {threads.map((thread) => {
              const lastMessage = thread.messages[0];

              return (
                <li key={thread.id}>
                  <Link href={`/courses/${courseId}/chat/${thread.id}`} className="block">
                    <Card className="transition-colors hover:bg-muted/50">
                      <CardHeader>
                        <div className="flex items-center justify-between gap-2">
                          <CardTitle className="text-base">{thread.title}</CardTitle>
                          <span className="text-muted-foreground text-xs">
                            {dateFormatter.format(thread.updatedAt)}
                          </span>
                        </div>
                        {lastMessage ? (
                          <p className="text-muted-foreground mt-1 truncate text-sm">
                            {lastMessage.content}
                          </p>
                        ) : null}
                      </CardHeader>
                    </Card>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
