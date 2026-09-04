import { auth } from "@/auth";
import { answerChatMessageStream } from "@/lib/ai/chat";
import { db } from "@/lib/db";
import { answerFromChunksStream } from "@/lib/rag/answer";
import { retrieveRelevantChunks } from "@/lib/rag/retrieve";
import { readUploadedFile } from "@/lib/uploads";

/**
 * Streaming counterpart to the old `sendChatMessage` server action: a
 * server action can only return once, at the end, so it can't relay tokens
 * as Gemini produces them. A plain-text streamed HTTP response can — the
 * client reads the body incrementally and appends it to the UI as it
 * arrives, instead of waiting for the whole reply to finish generating.
 */
export async function POST(
  request: Request,
  { params }: RouteContext<"/api/courses/[id]/chat/[threadId]/message">,
) {
  const session = await auth();

  if (!session?.user?.id) {
    return new Response("Not signed in.", { status: 401 });
  }

  const userId = session.user.id;
  const { id: courseId, threadId } = await params;

  const body = await request.json().catch(() => null);
  const message = typeof body?.message === "string" ? body.message.trim() : "";

  if (!message) {
    return new Response("Type a question first.", { status: 400 });
  }

  const thread = await db.chatThread.findFirst({
    where: { id: threadId, courseId, course: { userId } },
    include: { course: true },
  });

  if (!thread) {
    return new Response("Chat not found.", { status: 404 });
  }

  await db.chatMessage.create({
    data: { threadId: thread.id, role: "user", content: message },
  });

  const priorMessages = await db.chatMessage.findMany({
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
    if (thread.ragMode) {
      // RAG path: search by meaning across every chunk indexed for this
      // course (src/lib/rag/retrieve.ts), instead of reading whole
      // documents the user picked ahead of time.
      const chunks = await retrieveRelevantChunks(courseId, message);

      if (chunks.length === 0) {
        // retrieveRelevantChunks has no similarity threshold — an empty
        // result means the course has no indexed chunks at all yet, not
        // that nothing matched. Uploads now auto-index in the background
        // (src/app/courses/[id]/actions.ts), so this is almost always a
        // "still indexing" race rather than a real dead end; surface that
        // instead of forwarding an empty context to Gemini, which used to
        // come back with a confusing "no source excerpts were provided".
        textStream = (async function* () {
          yield "Your documents for this course haven't finished indexing for search yet " +
            "(this usually takes a few seconds after upload). Try again in a moment — or " +
            "open a document's page and use \"Index for search\" if it's been a while.";
        })();
      } else {
        const documentIds = [...new Set(chunks.map((chunk) => chunk.documentId))];
        const documents = await db.document.findMany({
          where: { id: { in: documentIds } },
          select: { id: true, fileName: true },
        });
        const fileNameByDocumentId = new Map(documents.map((d) => [d.id, d.fileName]));

        textStream = answerFromChunksStream(
          chunks.map((chunk) => ({
            content: chunk.content,
            fileName: fileNameByDocumentId.get(chunk.documentId) ?? "document",
            pageNumber: chunk.pageNumber,
          })),
          message,
        );
      }
    } else {
      const sourceDocumentIds = thread.documentId
        ? [thread.documentId]
        : (thread.sourceDocumentIds as string[]);

      const documents =
        sourceDocumentIds.length > 0
          ? await db.document.findMany({ where: { id: { in: sourceDocumentIds }, courseId } })
          : [];

      const sourceDocuments = await Promise.all(
        documents.map(async (document) => ({
          bytes: await readUploadedFile(document),
          mimeType: document.mimeType,
          fileName: document.fileName,
        })),
      );

      textStream = answerChatMessageStream(
        sourceDocuments,
        thread.course.title,
        history,
        message,
        thread.topic ?? undefined,
      );
    }
  } catch (error) {
    console.error("Failed to start chat stream", error);
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

        await db.chatMessage.create({
          data: { threadId: thread.id, role: "assistant", content: full },
        });
        controller.close();
      } catch (error) {
        console.error("Failed to answer chat message", error);
        controller.error(error);
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
