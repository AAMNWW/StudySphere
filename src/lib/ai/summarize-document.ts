import { createPartFromBase64, createUserContent, GoogleGenAI } from "@google/genai";
import { parseOffice } from "officeparser";

import { ALLOWED_FILE_TYPES } from "@/lib/uploads";

// gemini-3.6-flash has native PDF document vision (reads layout, figures and
// scanned pages, not just embedded text), which is why PDFs are sent to it
// directly instead of going through the officeparser text-extraction path
// below.
const MODEL = "gemini-3.6-flash";

const SUMMARY_PROMPT =
  "Summarize this document for a student studying it. Cover the main " +
  "topics and key points in 3-6 sentences, using plain language.";

let client: GoogleGenAI | undefined;

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  client ??= new GoogleGenAI({ apiKey });
  return client;
}

/**
 * Summarizes an uploaded document's contents with Gemini.
 *
 * PDFs are sent to Gemini directly — its document vision only meaningfully
 * understands PDFs, so DOCX/PPTX are extracted to plain text locally with
 * officeparser first and sent as a text prompt instead.
 */
export async function summarizeDocument(
  bytes: Buffer,
  mimeType: string,
  fileName: string,
): Promise<string> {
  const ai = getClient();

  if (mimeType === "application/pdf") {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: createUserContent([
        SUMMARY_PROMPT,
        createPartFromBase64(bytes.toString("base64"), mimeType),
      ]),
    });

    return requireText(response);
  }

  const fileType = ALLOWED_FILE_TYPES[mimeType]?.extension;
  const ast = await parseOffice(bytes, { fileType });
  const text = ast.toText().trim();

  if (!text) {
    throw new Error(`No extractable text found in "${fileName}".`);
  }

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: `${SUMMARY_PROMPT}\n\n---\n\n${text}`,
  });

  return requireText(response);
}

function requireText(response: Awaited<
  ReturnType<GoogleGenAI["models"]["generateContent"]>
>): string {
  const text = response.text?.trim();

  if (!text) {
    throw new Error("Gemini returned an empty summary.");
  }

  return text;
}
