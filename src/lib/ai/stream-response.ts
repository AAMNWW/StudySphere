/**
 * The chat answer generators (course chat, career chat, mock interview) are
 * lazy — no AI request is made until something iterates them. The message
 * routes used to hand them straight to a streaming Response, so an AI
 * failure (Gemini overloaded, out of quota) only surfaced after the 200 had
 * been sent: the connection was cut and the chat box showed a bare "Failed
 * to fetch". Waiting for the first chunk inside the route's own try/catch
 * moves that failure back to where a proper error status and message can
 * still be returned.
 */
export async function primeStream(stream: AsyncGenerator<string>): Promise<AsyncGenerator<string>> {
  const first = await stream.next();

  return (async function* () {
    if (!first.done) {
      yield first.value;
    }
    yield* stream;
  })();
}

/** A user-facing message for a failed AI request. The status is read off
 * the error object rather than `instanceof` for the same reason as in
 * ./client.ts. */
export function aiErrorMessage(error: unknown): string {
  const status =
    typeof error === "object" && error !== null && "status" in error
      ? (error as { status: unknown }).status
      : undefined;

  if (status === 429 || status === 503) {
    return "The AI is busy right now. Please try again in a minute.";
  }

  return "Could not get a response. Please try again.";
}
