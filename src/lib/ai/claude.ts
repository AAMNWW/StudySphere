import Anthropic from "@anthropic-ai/sdk";
import type { Part } from "@google/genai";

import type { ChatTurn } from "./chat";

/**
 * Claude powers the two chat surfaces (course chat in ./chat.ts, career chat
 * in ./career-chat.ts) when ANTHROPIC_API_KEY is set, with Gemini as the
 * fallback (see withGeminiFallback); everything else stays on Gemini
 * (./client.ts).
 *
 * Low effort because these are conversational turns, where a fast first
 * token matters more than deep deliberation. Thinking is left at the
 * model's adaptive default rather than disabled.
 */
export const CLAUDE_CHAT_MODEL = "claude-opus-5";

let client: Anthropic | undefined;

// Set after Claude rejects a request for account-level reasons (no credits,
// bad or revoked key): skip it for a while instead of making every chat
// message wait on a call that's bound to fail before falling back.
const ACCOUNT_ERROR_COOLDOWN_MS = 5 * 60_000;
let claudeUnavailableUntil = 0;

export function isClaudeConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY?.trim()) && Date.now() >= claudeUnavailableUntil;
}

function isAccountError(error: unknown): boolean {
  return (
    error instanceof Anthropic.BadRequestError ||
    error instanceof Anthropic.AuthenticationError ||
    error instanceof Anthropic.PermissionDeniedError
  );
}

/**
 * Streams from Claude when it's configured, falling back to `gemini` if the
 * Claude call fails before producing any text — so a key with no credits
 * left, an outage, or a request Claude rejects degrades to the Gemini answer
 * instead of a failed chat. A failure after text has already streamed is
 * rethrown: the user has seen a partial reply, and splicing a second model's
 * answer onto it would be worse than the error.
 */
export async function* withGeminiFallback(
  claude: () => AsyncGenerator<string>,
  gemini: () => AsyncGenerator<string>,
): AsyncGenerator<string> {
  if (isClaudeConfigured()) {
    let yielded = false;

    try {
      for await (const text of claude()) {
        yielded = true;
        yield text;
      }
      return;
    } catch (error) {
      if (yielded) {
        throw error;
      }
      if (isAccountError(error)) {
        claudeUnavailableUntil = Date.now() + ACCOUNT_ERROR_COOLDOWN_MS;
      }
      console.error("Claude chat failed; falling back to Gemini", error);
    }
  }

  yield* gemini();
}

function getClaudeClient(): Anthropic {
  client ??= new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY?.trim() });
  return client;
}

/** Converts the grounding content built by getDocumentsContent (Gemini
 * `Part`s for PDFs, labeled strings for extracted DOCX/PPTX text and PDF
 * excerpts) into Claude content blocks. */
function toClaudeBlocks(parts: (string | Part)[]): Anthropic.Beta.BetaContentBlockParam[] {
  return parts.flatMap((part): Anthropic.Beta.BetaContentBlockParam[] => {
    if (typeof part === "string") {
      return [{ type: "text", text: part }];
    }

    const inline = part.inlineData;
    if (inline?.data && inline.mimeType === "application/pdf") {
      return [
        {
          type: "document",
          source: { type: "base64", media_type: "application/pdf", data: inline.data },
        },
      ];
    }

    return part.text ? [{ type: "text", text: part.text }] : [];
  });
}

/**
 * Streams one chat reply from Claude.
 *
 * The documents go in the first user turn, and the whole request is
 * auto-cached: every turn resends the same documents and the same history
 * prefix, so from the second message on those are read from cache instead
 * of reprocessed — that's most of the latency on a document-grounded chat.
 */
export async function* streamClaudeChat({
  system,
  grounding,
  acknowledgement,
  history,
  question,
}: {
  system: string;
  /** Document content from getDocumentsContent; empty for ungrounded chat. */
  grounding: (string | Part)[];
  acknowledgement: string;
  history: ChatTurn[];
  question: string;
}): AsyncGenerator<string> {
  const messages: Anthropic.Beta.BetaMessageParam[] = [];

  if (grounding.length > 0) {
    messages.push(
      {
        role: "user",
        content: [
          ...toClaudeBlocks(grounding),
          { type: "text", text: "These are the documents for this conversation." },
        ],
      },
      { role: "assistant", content: acknowledgement },
    );
  }

  messages.push(
    ...history.map((turn) => ({ role: turn.role, content: turn.content })),
    { role: "user", content: question },
  );

  const stream = getClaudeClient().beta.messages.stream({
    model: CLAUDE_CHAT_MODEL,
    max_tokens: 64000,
    system,
    messages,
    cache_control: { type: "ephemeral" },
    output_config: { effort: "low" },
    // On a safety-classifier decline, the API re-runs the request on a
    // fallback model inside the same call instead of just stopping.
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
  });

  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      yield event.delta.text;
    }
  }

  const final = await stream.finalMessage();
  if (final.stop_reason === "refusal") {
    yield "\n\nSorry — I can't help with that request.";
  }
}
