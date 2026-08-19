import { GoogleGenAI } from "@google/genai";

// gemini-3.6-flash has native PDF document vision (reads layout, figures and
// scanned pages, not just embedded text), which is why PDFs are sent to it
// directly rather than through the officeparser text-extraction path used
// for DOCX/PPTX.
export const MODEL = "gemini-3.6-flash";

let client: GoogleGenAI | undefined;

export function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  client ??= new GoogleGenAI({ apiKey });
  return client;
}
