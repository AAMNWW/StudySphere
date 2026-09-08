import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BackLink } from "@/components/back-link";
import { ChatPanel } from "@/components/chat-panel";
import { requireUserId } from "@/lib/auth";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";

import { EndInterviewButton } from "../_components/end-interview-button";
import { InterviewFeedbackCard } from "../_components/interview-feedback-card";

export async function generateMetadata({
  params,
}: PageProps<"/career/interviews/[id]">): Promise<Metadata> {
  const userId = await requireUserId();
  const { id } = await params;
  const session = await db.interviewSession.findFirst({
    where: { id, userId },
    select: { role: true, company: true },
  });

  return {
    title: session ? `${session.role}${session.company ? ` — ${session.company}` : ""}` : "Interview not found",
  };
}

export default async function InterviewSessionPage({
  params,
}: PageProps<"/career/interviews/[id]">) {
  const userId = await requireUserId();
  const { id: sessionId } = await params;

  const session = await db.interviewSession.findFirst({
    where: { id: sessionId, userId },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  if (!session) {
    notFound();
  }

  return (
    <main className="max-w-3xl">
      <BackLink href="/career/interviews">Back to Mock Interviews</BackLink>
      <h1 className="mt-4 mb-8 text-2xl font-bold tracking-tight">
        {session.role}
        {session.company ? ` — ${session.company}` : ""}
      </h1>

      {session.status === "COMPLETED" ? (
        <>
          <InterviewFeedbackCard
            sessionId={session.id}
            feedback={session.feedback}
            feedbackError={session.feedbackError}
          />

          <div className="bg-card space-y-3 rounded-2xl border border-black/5 p-4 shadow-sm">
            {session.messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  message.role === "user" ? "justify-end" : "justify-start",
                )}
              >
                <p
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3.5 py-2 text-sm whitespace-pre-wrap",
                    message.role === "user"
                      ? "bg-foreground text-background"
                      : "bg-muted text-foreground",
                  )}
                >
                  {message.content}
                </p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <ChatPanel
            endpoint={`/api/career/interviews/${session.id}/message`}
            messages={session.messages}
            emptyHint="The interviewer will greet you and ask the first question."
          />
          <EndInterviewButton sessionId={session.id} />
        </div>
      )}
    </main>
  );
}
