import { createUserContent, type Content, type Part } from "@google/genai";

import { getClient, MODEL } from "./client";
import { getDocumentContent } from "./document-content";
import { requireText } from "./summarize-document";

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

const DOCUMENT_CHAT_SYSTEM_PROMPT =
  "You are a helpful study assistant answering a student's questions about " +
  "a document they uploaded. Answer only using the document's content; if " +
  "the answer isn't in the document, say so plainly. Keep answers concise.";

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
 * Answers a question about one uploaded document, grounded in its content.
 *
 * There's no persistent chat session on Gemini's side — each call resends
 * the document plus the full prior conversation, since the API is
 * stateless per request. Fine at the current file-size cap (15MB); a longer
 * history or larger files would need the Files API instead.
 */
export async function answerDocumentChatMessage(
  bytes: Buffer,
  mimeType: string,
  fileName: string,
  history: ChatTurn[],
  question: string,
): Promise<string> {
  const ai = getClient();
  const document = await getDocumentContent(bytes, mimeType, fileName);

  const groundingParts: (string | Part)[] = [DOCUMENT_CHAT_SYSTEM_PROMPT];
  groundingParts.push(
    document.kind === "part"
      ? document.part
      : `Document contents:\n\n${document.text}`,
  );

  const contents: Content[] = [
    createUserContent(groundingParts),
    { role: "model", parts: [{ text: "Understood — ask me anything about this document." }] },
    ...turnsToContents(history),
    createUserContent([question]),
  ];

  const response = await ai.models.generateContent({ model: MODEL, contents });
  return requireText(response);
}

/**
 * Answers a general study question, not grounded in any specific document.
 */
export async function answerTutorMessage(
  courseTitle: string,
  history: ChatTurn[],
  question: string,
): Promise<string> {
  const ai = getClient();

  const contents: Content[] = [
    createUserContent([`${TUTOR_SYSTEM_PROMPT} The student is studying: ${courseTitle}.`]),
    { role: "model", parts: [{ text: "Got it — what would you like help with?" }] },
    ...turnsToContents(history),
    createUserContent([question]),
  ];

  const response = await ai.models.generateContent({ model: MODEL, contents });
  return requireText(response);
}
