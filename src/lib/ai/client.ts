import {
  GoogleGenAI,
  ThinkingLevel,
  type EmbedContentParameters,
  type GenerateContentConfig,
  type GenerateContentParameters,
} from "@google/genai";

import { groqGenerate, groqGenerateStream, isGroqConfigured } from "./groq";

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

let gemini: GoogleGenAI | undefined;

function getGemini(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  gemini ??= new GoogleGenAI({ apiKey });
  return gemini;
}

// Status is read off the error object rather than checked with
// `instanceof ApiError` — this repo has repeatedly hit cases (see
// document-content.ts, pdf.ts) where Next.js splitting a class's module
// across per-Server-Action bundle chunks makes `instanceof` unreliable in
// production; a plain property read survives that.
function errorStatus(error: unknown): number | undefined {
  return typeof error === "object" && error !== null && "status" in error
    ? ((error as { status: unknown }).status as number)
    : undefined;
}

/** Gemini's "out of quota" 429 (as opposed to a per-minute rate limit) won't
 * clear by retrying — it lasts until the daily reset. */
function isQuotaExhausted(error: unknown): boolean {
  return errorStatus(error) === 429 && /quota/i.test(String((error as Error)?.message));
}

// Transient Gemini failures (503 "high demand", 429 rate limits, 500s).
const RETRYABLE_STATUS_CODES = new Set([429, 500, 503]);
const RETRY_DELAY_MS = 2000;
// After an out-of-quota error, go straight to Groq for a while rather than
// paying for a failing Gemini call on every request.
const QUOTA_COOLDOWN_MS = 10 * 60_000;
let geminiUnavailableUntil = 0;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Retries transient Gemini errors with a growing backoff — briefly when
 * Groq can take over (1 retry), longer when it can't (4 retries, ~20s). */
async function withRetry<T>(call: () => Promise<T>): Promise<T> {
  const maxRetries = isGroqConfigured() ? 1 : 4;

  for (let attempt = 0; ; attempt++) {
    try {
      return await call();
    } catch (error) {
      if (isQuotaExhausted(error)) {
        geminiUnavailableUntil = Date.now() + QUOTA_COOLDOWN_MS;
        throw error;
      }
      if (attempt >= maxRetries || !RETRYABLE_STATUS_CODES.has(errorStatus(error) ?? 0)) {
        throw error;
      }
      await sleep(RETRY_DELAY_MS * (attempt + 1));
    }
  }
}

function shouldUseGemini(): boolean {
  return Boolean(process.env.GEMINI_API_KEY) && (!isGroqConfigured() || Date.now() >= geminiUnavailableUntil);
}

/** Whether a failed Gemini request should be re-sent to Groq: anything that
 * isn't the request's own fault (quota, overload, outage, missing key). */
function shouldFallBack(error: unknown): boolean {
  const status = errorStatus(error);
  return isGroqConfigured() && (status === undefined || status === 429 || status >= 500);
}

type TextChunk = { text?: string };

async function* asChunks(stream: AsyncIterable<string>): AsyncGenerator<TextChunk> {
  for await (const text of stream) yield { text };
}

/** Starts a stream and waits for its first chunk, so a provider that fails
 * up front throws here (where we can still fall back) rather than later. */
async function primed<T>(stream: AsyncGenerator<T>): Promise<AsyncGenerator<T>> {
  const first = await stream.next();
  return (async function* () {
    if (!first.done) yield first.value;
    yield* stream;
  })();
}

/**
 * The AI client every feature uses. Same call shapes as the Gemini SDK
 * (`models.generateContent` / `generateContentStream` / `embedContent`), but
 * text generation falls back to Groq (./groq.ts) when Gemini is out of quota
 * or unavailable — the same request, translated. Callers only read `.text`
 * off responses and chunks, which both providers supply.
 *
 * `preferFast` on a stream sends it to Groq first (Gemini as the fallback):
 * used for plain chat turns, where Groq's much faster first token matters
 * and there's no PDF for Gemini's document vision to read.
 */
export function getClient() {
  return {
    models: {
      async generateContent(params: GenerateContentParameters): Promise<TextChunk> {
        if (shouldUseGemini()) {
          try {
            return await withRetry(() => getGemini().models.generateContent(params));
          } catch (error) {
            if (!shouldFallBack(error)) throw error;
            console.warn("Gemini unavailable; using Groq", errorStatus(error));
          }
        }
        return { text: await groqGenerate(params) };
      },

      async generateContentStream(
        params: GenerateContentParameters,
        { preferFast = false }: { preferFast?: boolean } = {},
      ): Promise<AsyncGenerator<TextChunk>> {
        if (preferFast && isGroqConfigured()) {
          try {
            return await primed(asChunks(groqGenerateStream(params)));
          } catch (error) {
            if (!process.env.GEMINI_API_KEY) throw error;
            console.warn("Groq unavailable; using Gemini", errorStatus(error));
          }
        }

        if (shouldUseGemini()) {
          try {
            return await withRetry(async () =>
              primed(await getGemini().models.generateContentStream(params)),
            );
          } catch (error) {
            if (!shouldFallBack(error) || preferFast) throw error;
            console.warn("Gemini unavailable; using Groq", errorStatus(error));
          }
        }

        return primed(asChunks(groqGenerateStream(params)));
      },

      embedContent(params: EmbedContentParameters) {
        // Groq has no embedding model, so search indexing stays Gemini-only.
        return withRetry(() => getGemini().models.embedContent(params));
      },
    },
  };
}

/** Kept so existing call sites read the same; retries and the Groq
 * fallback now live inside getClient() itself. */
export async function withGeminiRetry<T>(call: () => Promise<T>): Promise<T> {
  return call();
}
