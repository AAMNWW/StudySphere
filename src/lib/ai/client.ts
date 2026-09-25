import { GoogleGenAI, ThinkingLevel, type GenerateContentConfig } from "@google/genai";

// gemini-3.6-flash has native PDF document vision (reads layout, figures and
// scanned pages, not just embedded text), which is why PDFs are sent to it
// directly rather than through the officeparser text-extraction path used
// for DOCX/PPTX.
export const MODEL = "gemini-3.6-flash";

/**
 * Config for live, back-and-forth chat turns (course chat, career chat, the
 * mock interviewer). Gemini 3 models think before answering by default; at
 * MINIMAL the first words of a reply arrived in ~1-1.5s instead of ~6-7s in
 * testing, with answers of the same length. One-shot generation (quizzes,
 * summaries, interview feedback) keeps the default, where the extra
 * reasoning is worth the wait.
 */
export const FAST_CHAT_CONFIG: GenerateContentConfig = {
  thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
};

let client: GoogleGenAI | undefined;

export function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  client ??= new GoogleGenAI({ apiKey });
  return client;
}

// Gemini occasionally answers with a transient 503 ("model is currently
// experiencing high demand") or 429 (rate limited) — both go away on their
// own within seconds. Every AI feature calls generateContent(Stream)
// through here so a single overload blip doesn't surface as a hard failure
// to the user. Status is read off the error object rather than checked with
// `instanceof ApiError` — this repo has repeatedly hit cases (see
// document-content.ts, pdf.ts) where Next.js splitting a class's module
// across per-Server-Action bundle chunks makes `instanceof` unreliable in
// production; a plain property read survives that.
// 503 "high demand" spells can outlast a couple of quick retries, so back
// off for longer: 2s, 4s, 6s, 8s (~20s worst case) before giving up.
const RETRYABLE_STATUS_CODES = new Set([429, 500, 503]);
const MAX_RETRIES = 4;
const RETRY_DELAY_MS = 2000;

function isRetryableGeminiError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    RETRYABLE_STATUS_CODES.has((error as { status: unknown }).status as number)
  );
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withGeminiRetry<T>(call: () => Promise<T>): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await call();
    } catch (error) {
      if (attempt >= MAX_RETRIES || !isRetryableGeminiError(error)) {
        throw error;
      }
      await sleep(RETRY_DELAY_MS * (attempt + 1));
    }
  }
}
