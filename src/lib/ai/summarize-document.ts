import { createUserContent, type GoogleGenAI } from "@google/genai";

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

export function requireText(
  response: Awaited<ReturnType<GoogleGenAI["models"]["generateContent"]>>,
): string {
  const text = response.text?.trim();

  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }

  return text;
}
