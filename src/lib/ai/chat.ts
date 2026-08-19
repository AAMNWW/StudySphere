import { createUserContent, type Content, type Part } from "@google/genai";

import { getClient, MODEL } from "./client";
import { getDocumentsContent, type SourceDocument } from "./document-content";
import { requireText } from "./summarize-document";

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
 * tutor for the course ("AI tutor").
 *
 * There's no persistent chat session on Gemini's side — each call resends
 * any grounding documents plus the full prior conversation, since the API
 * is stateless per request. Fine at the current per-thread document cap; a
 * longer history or many large files would need the Files API instead.
 */
export async function answerChatMessage(
  documents: SourceDocument[],
  courseTitle: string,
  history: ChatTurn[],
  question: string,
  topic?: string,
): Promise<string> {
  const ai = getClient();
  const topicClause = topic ? ` The student wants to focus on: "${topic}".` : "";

  const groundingParts: (string | Part)[] = [];
  let acknowledgement = "Got it — what would you like help with?";

  if (documents.length > 0) {
    groundingParts.push(`${GROUNDED_CHAT_SYSTEM_PROMPT}${topicClause}`);
    groundingParts.push(...(await getDocumentsContent(documents)));
    acknowledgement =
      documents.length > 1
        ? "Understood — ask me anything about these documents."
        : "Understood — ask me anything about this document.";
  } else {
    groundingParts.push(
      `${TUTOR_SYSTEM_PROMPT} The student is studying: ${courseTitle}.${topicClause}`,
    );
  }

  const contents: Content[] = [
    createUserContent(groundingParts),
    { role: "model", parts: [{ text: acknowledgement }] },
    ...turnsToContents(history),
    createUserContent([question]),
  ];

  const response = await ai.models.generateContent({ model: MODEL, contents });
  return requireText(response);
}
