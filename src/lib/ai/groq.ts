import type { Content, GenerateContentParameters, Part } from "@google/genai";
import { parseOffice } from "officeparser";

/**
 * Groq (groq.com): a second AI provider behind the same calls every feature
 * already makes through `getClient()` (./client.ts). It serves as
 *  - the fallback whenever Gemini is out of quota or overloaded, and
 *  - the first choice for plain back-and-forth chat, where its very fast
 *    first token matters most.
 *
 * Groq speaks the OpenAI chat-completions format, so this module translates
 * a Gemini request (contents, system instruction, JSON-output config) into
 * that shape. Groq models are text-only: PDFs that Gemini would read
 * natively are text-extracted first, and very long material is trimmed to
 * fit Groq's request limits.
 */

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
// gpt-oss-120b at low reasoning effort measured a ~0.6s first token (vs
// 1.5–7s on Gemini) and returned valid JSON for quiz-style prompts.
export const GROQ_MODEL = process.env.GROQ_MODEL?.trim() || "openai/gpt-oss-120b";

// Groq's free tier allows 8,000 tokens per minute for this model, request
// and reply combined, so document text beyond ~3.5k tokens is cut.
const MAX_DOCUMENT_CHARS = 14_000;

export function isGroqConfigured(): boolean {
  return Boolean(process.env.GROQ_API_KEY?.trim());
}

type GroqMessage = { role: "system" | "user" | "assistant"; content: string };

/** Thrown with an HTTP-style `status`, which is what aiErrorMessage and the
 * Gemini retry logic read (see ./stream-response.ts, ./client.ts). */
class GroqError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "GroqError";
  }
}

async function partToText(part: string | Part, budget: { chars: number }): Promise<string> {
  const text = typeof part === "string" ? part : part.text;
  if (text) {
    // Short strings are prompts/instructions and pass through whole; long
    // ones are extracted document text (DOCX/PPTX, PDF excerpts) and share
    // the same size budget as PDFs.
    if (text.length <= 4_000) return text;
    const kept = text.slice(0, Math.max(0, budget.chars));
    budget.chars -= kept.length;
    return kept.length < text.length ? `${kept}
[…truncated to fit]` : kept;
  }
  if (typeof part === "string") return "";

  const inline = part.inlineData;
  if (inline?.data && inline.mimeType === "application/pdf") {
    const ast = await parseOffice(Buffer.from(inline.data, "base64"), { fileType: "pdf" });
    let text = ast.toText().trim();

    if (text.length > budget.chars) {
      text = `${text.slice(0, Math.max(0, budget.chars))}\n[…document truncated to fit]`;
    }
    budget.chars -= text.length;
    return `--- Document ---\n${text}`;
  }

  return "";
}

function isContent(value: unknown): value is Content {
  return typeof value === "object" && value !== null && "parts" in value;
}

/** Gemini `contents` in any of its accepted shapes → chat messages. */
async function toMessages(params: GenerateContentParameters): Promise<GroqMessage[]> {
  const budget = { chars: MAX_DOCUMENT_CHARS };
  const messages: GroqMessage[] = [];

  const system = params.config?.systemInstruction;
  if (system) {
    const parts = typeof system === "string" ? [system] : isContent(system) ? (system.parts ?? []) : [system as Part];
    messages.push({
      role: "system",
      content: (await Promise.all(parts.map((part) => partToText(part, budget)))).join("\n\n"),
    });
  }

  const contents = Array.isArray(params.contents) ? params.contents : [params.contents];
  // A flat list of parts/strings is a single user turn; Content items are
  // separate turns with their own roles.
  const turns: Content[] = contents.every(isContent)
    ? (contents as Content[])
    : [{ role: "user", parts: contents as (string | Part)[] as Part[] }];

  for (const turn of turns) {
    const text = (await Promise.all((turn.parts ?? []).map((part) => partToText(part, budget))))
      .filter(Boolean)
      .join("\n\n");
    if (text) {
      messages.push({ role: turn.role === "model" ? "assistant" : "user", content: text });
    }
  }

  const config = params.config;
  if (config?.responseMimeType === "application/json") {
    const schema = config.responseSchema ? `\n${JSON.stringify(config.responseSchema)}` : "";
    messages.push({
      role: "system",
      content: `Respond with a single JSON object only, no prose or code fences, matching this schema (types in capitals mean JSON types):${schema}`,
    });
  }

  return messages;
}

async function callGroq(params: GenerateContentParameters, stream: boolean): Promise<Response> {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) {
    throw new GroqError("GROQ_API_KEY is not configured.", 500);
  }

  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: await toMessages(params),
      stream,
      // gpt-oss models reason before answering; "low" keeps that short.
      ...(GROQ_MODEL.startsWith("openai/gpt-oss") ? { reasoning_effort: "low" } : {}),
      ...(params.config?.responseMimeType === "application/json"
        ? { response_format: { type: "json_object" } }
        : {}),
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new GroqError(`Groq request failed (${response.status}): ${detail.slice(0, 300)}`, response.status);
  }

  return response;
}

/** Groq equivalent of `ai.models.generateContent` — resolves to the reply text. */
export async function groqGenerate(params: GenerateContentParameters): Promise<string> {
  const response = await callGroq(params, false);
  const data = (await response.json()) as { choices?: { message?: { content?: string } }[] };
  return data.choices?.[0]?.message?.content ?? "";
}

/** Groq equivalent of `ai.models.generateContentStream` — yields text deltas
 * parsed from the server-sent event stream. */
export async function* groqGenerateStream(params: GenerateContentParameters): AsyncGenerator<string> {
  const response = await callGroq(params, true);
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const data = line.trim().replace(/^data:\s*/, "");
      if (!data || data === "[DONE]" || !line.trim().startsWith("data:")) continue;

      const event = JSON.parse(data) as { choices?: { delta?: { content?: string } }[] };
      const text = event.choices?.[0]?.delta?.content;
      if (text) yield text;
    }
  }
}
