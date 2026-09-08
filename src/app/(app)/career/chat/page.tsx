import { MessageCircle } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { IconTile } from "@/components/icon-tile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/db";

import { DeleteCareerChatButton } from "./_components/delete-career-chat-button";
import { NewCareerChatForm } from "./_components/new-career-chat-form";

export const metadata: Metadata = {
  title: "Career Chat",
};

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

export default async function CareerChatHubPage() {
  const userId = await requireUserId();

  const [resumes, threads] = await Promise.all([
    db.resume.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true },
    }),
    db.careerChatThread.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      include: { messages: { orderBy: { createdAt: "desc" }, take: 1 } },
    }),
  ]);

  return (
    <main className="max-w-2xl">
      <header className="mb-8 flex items-center gap-3">
        <IconTile color="pink">
          <MessageCircle className="size-5" />
        </IconTile>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Chat</h1>
          <p className="text-muted-foreground text-sm">
            Chat with a resume for specific feedback, or talk generally with an AI career coach.
          </p>
        </div>
      </header>

      <Card className="mb-10">
        <CardHeader>
          <CardTitle>New chat</CardTitle>
        </CardHeader>
        <CardContent>
          <NewCareerChatForm resumes={resumes} />
        </CardContent>
      </Card>

      <section aria-labelledby="career-chat-list-heading">
        <h2 id="career-chat-list-heading" className="mb-4 text-lg font-bold">
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
                  <Card className="transition-colors hover:bg-muted/50">
                    <CardHeader>
                      <div className="flex items-center justify-between gap-2">
                        <Link href={`/career/chat/${thread.id}`} className="min-w-0 flex-1">
                          <CardTitle className="text-base">{thread.title}</CardTitle>
                          {lastMessage ? (
                            <p className="text-muted-foreground mt-1 truncate text-sm">
                              {lastMessage.content}
                            </p>
                          ) : null}
                        </Link>
                        <div className="flex shrink-0 items-center gap-2">
                          <span className="text-muted-foreground text-xs">
                            {dateFormatter.format(thread.updatedAt)}
                          </span>
                          <DeleteCareerChatButton threadId={thread.id} threadLabel={thread.title} />
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
