import { auth } from "@/auth";
import { answerInterviewMessageStream } from "@/lib/ai/interview";
import { db } from "@/lib/db";
import { readResumeFile } from "@/lib/uploads";

/**
 * Streaming counterpart to a mock interview session's turns, mirroring
 * src/app/api/career/chat/[threadId]/message/route.ts. The interviewer's
 * opening question is generated at session-creation time instead (see
 * src/app/career/interviews/actions.ts), so every call here is a candidate
 * answer plus the interviewer's next question/follow-up.
 */
export async function POST(
  request: Request,
  { params }: RouteContext<"/api/career/interviews/[sessionId]/message">,
) {
  const session = await auth();

  if (!session?.user?.id) {
    return new Response("Not signed in.", { status: 401 });
  }

  const userId = session.user.id;
  const { sessionId } = await params;

  const body = await request.json().catch(() => null);
  const message = typeof body?.message === "string" ? body.message.trim() : "";

  if (!message) {
    return new Response("Type an answer first.", { status: 400 });
  }

  const interviewSession = await db.interviewSession.findFirst({
    where: { id: sessionId, userId },
    include: { resume: true },
  });

  if (!interviewSession) {
    return new Response("Interview not found.", { status: 404 });
  }

  if (interviewSession.status === "COMPLETED") {
    return new Response("This interview has already ended.", { status: 400 });
  }

  await db.interviewMessage.create({
    data: { sessionId: interviewSession.id, role: "user", content: message },
  });

  const priorMessages = await db.interviewMessage.findMany({
    where: { sessionId: interviewSession.id },
    orderBy: { createdAt: "asc" },
  });

  // The message just inserted is the last row, so everything before it is
  // "prior" history and the new answer is passed separately.
  const history = priorMessages.slice(0, -1).map((entry) => ({
    role: entry.role as "user" | "assistant",
    content: entry.content,
  }));

  let textStream: AsyncGenerator<string>;

  try {
    const resumeSource = interviewSession.resume
      ? {
          bytes: await readResumeFile(interviewSession.resume),
          mimeType: interviewSession.resume.mimeType,
          fileName: interviewSession.resume.fileName,
        }
      : null;

    textStream = answerInterviewMessageStream(
      interviewSession.role,
      interviewSession.company,
      resumeSource,
      history,
      message,
    );
  } catch (error) {
    console.error("Failed to start interview stream", error);
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

        await db.interviewMessage.create({
          data: { sessionId: interviewSession.id, role: "assistant", content: full },
        });
        await db.interviewSession.update({
          where: { id: interviewSession.id },
          data: { updatedAt: new Date() },
        });
        controller.close();
      } catch (error) {
        console.error("Failed to answer interview message", error);
        controller.error(error);
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
