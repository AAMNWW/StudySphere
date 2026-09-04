import { createUserContent, type Content, type Part } from "@google/genai";

import { getClient, MODEL, withGeminiRetry } from "./client";
import { getDocumentsContent, type SourceDocument } from "./document-content";

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

const RESUME_CHAT_SYSTEM_PROMPT =
  "You are an experienced career coach reviewing a student's resume with " +
  "them. Answer only using the resume's content; give honest, concrete " +
  "feedback on wording, impact, and gaps when asked, and say so plainly if " +
  "something isn't on the resume. Keep answers focused and concise.";

const CAREER_COACH_SYSTEM_PROMPT =
  "You are a friendly, knowledgeable AI career coach helping a student " +
  "navigate job hunting: resumes, cover letters, interviews, career paths, " +
  "networking, salary negotiation, and job search strategy. Give practical, " +
  "specific advice and keep answers focused and concise.";

function turnsToContents(history: ChatTurn[]): Content[] {
  return history.map((turn) => ({
    role: turn.role === "user" ? "user" : "model",
    parts: [{ text: turn.content }],
  }));
}

/**
 * Answers a career-chat message, either grounded in one resume ("Resume
 * Chat") when `resume` is given, or as a general career coach when it's
 * null. Mirrors src/lib/ai/chat.ts's answerChatMessageStream — same
 * stateless-per-request streaming shape, just a different grounding source.
 */
export async function* answerCareerChatMessageStream(
  resume: SourceDocument | null,
  history: ChatTurn[],
  question: string,
): AsyncGenerator<string> {
  const ai = getClient();

  const groundingParts: (string | Part)[] = [];
  let acknowledgement = "Got it — what would you like to talk about?";

  if (resume) {
    groundingParts.push(RESUME_CHAT_SYSTEM_PROMPT);
    groundingParts.push(...(await getDocumentsContent([resume])));
    acknowledgement = "Understood — ask me anything about this resume.";
  } else {
    groundingParts.push(CAREER_COACH_SYSTEM_PROMPT);
  }

  const contents: Content[] = [
    createUserContent(groundingParts),
    { role: "model", parts: [{ text: acknowledgement }] },
    ...turnsToContents(history),
    createUserContent([question]),
  ];

  const stream = await withGeminiRetry(() =>
    ai.models.generateContentStream({ model: MODEL, contents }),
  );

  for await (const chunk of stream) {
    if (chunk.text) yield chunk.text;
  }
}
