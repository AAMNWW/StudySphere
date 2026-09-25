import { createUserContent } from "@google/genai";

import { getClient, MODEL, withGeminiRetry } from "./client";
import { getDocumentContent } from "./document-content";

const SUMMARY_PROMPT =
  "Summarize this document for a student studying it. Cover the main " +
  "topics and key points in 3-6 sentences, using plain language.";

/** Summarizes an uploaded document's contents with Gemini. */
export async function summarizeDocument(
  bytes: Buffer,
  mimeType: string,
  fileName: string,
): Promise<string> {
  const ai = getClient();
  const document = await getDocumentContent(bytes, mimeType, fileName);

  const contents =
    document.kind === "part"
      ? createUserContent([SUMMARY_PROMPT, document.part])
      : `${SUMMARY_PROMPT}\n\n---\n\n${document.text}`;

  const response = await withGeminiRetry(() =>
    ai.models.generateContent({ model: MODEL, contents }),
  );
  return requireText(response);
}

/** The reply text from either AI provider (see getClient in ./client.ts).
 * Strips a ```json fence if a model wrapped JSON output in one. */
export function requireText(response: { text?: string }): string {
  const text = response.text
    ?.trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  if (!text) {
    throw new Error("The model returned an empty response.");
  }

  return text;
}
