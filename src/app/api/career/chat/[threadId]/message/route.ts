import { auth } from "@/auth";
import { answerCareerChatMessageStream } from "@/lib/ai/career-chat";
import { db } from "@/lib/db";
import { readResumeFile } from "@/lib/uploads";

/**
 * Streaming counterpart to the career chat threads, mirroring
 * src/app/api/courses/[id]/chat/[threadId]/message/route.ts — a Server
 * Action can only return once at the end, so it can't relay Gemini's reply
 * token-by-token the way a streamed HTTP response can.
 */
export async function POST(
  request: Request,
  { params }: RouteContext<"/api/career/chat/[threadId]/message">,
) {
  const session = await auth();

  if (!session?.user?.id) {
    return new Response("Not signed in.", { status: 401 });
  }

  const userId = session.user.id;
  const { threadId } = await params;

  const body = await request.json().catch(() => null);
  const message = typeof body?.message === "string" ? body.message.trim() : "";

  if (!message) {
    return new Response("Type a question first.", { status: 400 });
  }

  const thread = await db.careerChatThread.findFirst({
    where: { id: threadId, userId },
    include: { resume: true },
  });

  if (!thread) {
    return new Response("Chat not found.", { status: 404 });
  }

  await db.careerChatMessage.create({
    data: { threadId: thread.id, role: "user", content: message },
  });

  const priorMessages = await db.careerChatMessage.findMany({
    where: { threadId: thread.id },
    orderBy: { createdAt: "asc" },
  });

  // The message just inserted is the last row, so everything before it is
  // "prior" history and the new question is passed separately.
  const history = priorMessages.slice(0, -1).map((entry) => ({
    role: entry.role as "user" | "assistant",
    content: entry.content,
  }));

  let textStream: AsyncGenerator<string>;

  try {
    const resumeSource = thread.resume
      ? {
          bytes: await readResumeFile(thread.resume),
          mimeType: thread.resume.mimeType,
          fileName: thread.resume.fileName,
        }
      : null;

    textStream = answerCareerChatMessageStream(resumeSource, history, message);
  } catch (error) {
    console.error("Failed to start career chat stream", error);
    return new Response("Could not get a response. Please try again.", { status: 500 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let full = "";

      try {
        for await (const chunk of textStream) {
          full += chunk;
          controller.enqueue(encoder.encode(chunk));
        }

        if (!full.trim()) {
          throw new Error("Gemini returned an empty response.");
        }

        await db.careerChatMessage.create({
          data: { threadId: thread.id, role: "assistant", content: full },
        });
        await db.careerChatThread.update({
          where: { id: thread.id },
          data: { updatedAt: new Date() },
        });
        controller.close();
      } catch (error) {
        console.error("Failed to answer career chat message", error);
        controller.error(error);
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
