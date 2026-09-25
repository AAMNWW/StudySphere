import { createUserContent, type Content, type Part } from "@google/genai";

import { streamClaudeChat, withGeminiFallback } from "./claude";
import { FAST_CHAT_CONFIG, getClient, MODEL, withGeminiRetry } from "./client";
import { getDocumentsContent, type SourceDocument } from "./document-content";

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

const GROUNDED_CHAT_SYSTEM_PROMPT =
  "You are a helpful study assistant answering a student's questions about " +
  "the document(s) they uploaded. Answer only using their content; if the " +
  "answer isn't in the material, say so plainly. Keep answers concise.";

const TUTOR_SYSTEM_PROMPT =
  "You are a friendly, encouraging AI study tutor helping a student " +
  "understand their coursework. Explain concepts clearly and simply, use " +
  "examples where they help, and keep answers focused and concise.";

function turnsToContents(history: ChatTurn[]): Content[] {
  return history.map((turn) => ({
    role: turn.role === "user" ? "user" : "model",
    parts: [{ text: turn.content }],
  }));
}

/**
 * Answers a chat message, either grounded in one or more documents ("chat
 * about these documents") or, when `documents` is empty, as a general study
 * tutor for the course ("AI tutor"). Streamed token-by-token (rather than
 * one blocking call) so the UI can render the reply as it arrives instead
 * of waiting for the whole answer to finish generating.
 *
 * Runs on Claude when ANTHROPIC_API_KEY is set (see ./claude.ts), Gemini
 * otherwise. There's no persistent chat session on either side — each call resends
 * any grounding documents plus the full prior conversation, since the API
 * is stateless per request. Fine at the current per-thread document cap; a
 * longer history or many large files would need the Files API instead.
 */
export async function* answerChatMessageStream(
  documents: SourceDocument[],
  courseTitle: string,
  history: ChatTurn[],
  question: string,
  topic?: string,
): AsyncGenerator<string> {
  const topicClause = topic ? ` The student wants to focus on: "${topic}".` : "";

  let systemPrompt = `${TUTOR_SYSTEM_PROMPT} The student is studying: ${courseTitle}.${topicClause}`;
  let documentParts: (string | Part)[] = [];
  let acknowledgement = "Got it — what would you like help with?";

  if (documents.length > 0) {
    systemPrompt = `${GROUNDED_CHAT_SYSTEM_PROMPT}${topicClause}`;
    documentParts = await getDocumentsContent(documents);
    acknowledgement =
      documents.length > 1
        ? "Understood — ask me anything about these documents."
        : "Understood — ask me anything about this document.";
  }

  yield* withGeminiFallback(
    () =>
      streamClaudeChat({
        system: systemPrompt,
        grounding: documentParts,
        acknowledgement,
        history,
        question,
      }),
    async function* () {
      const ai = getClient();
      const groundingParts: (string | Part)[] = [systemPrompt, ...documentParts];

      const contents: Content[] = [
        createUserContent(groundingParts),
        { role: "model", parts: [{ text: acknowledgement }] },
        ...turnsToContents(history),
        createUserContent([question]),
      ];

      const stream = await withGeminiRetry(() =>
        ai.models.generateContentStream(
          { model: MODEL, contents, config: FAST_CHAT_CONFIG },
          // No documents: nothing for Gemini's PDF vision to read, so take
          // Groq's faster reply.
          { preferFast: documentParts.length === 0 },
        ),
      );

      for await (const chunk of stream) {
        if (chunk.text) yield chunk.text;
      }
    },
  );
}
