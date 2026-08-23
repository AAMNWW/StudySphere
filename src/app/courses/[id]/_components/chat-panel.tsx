"use client";

import { Send } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ChatMessageItem {
  id: string;
  role: string;
  content: string;
}

/**
 * Fetches from the streaming route (src/app/api/courses/[id]/chat/
 * [threadId]/message/route.ts) instead of calling a Server Action, since a
 * Server Action can only return once at the end — it can't relay Gemini's
 * reply token-by-token the way a streamed HTTP response can. `streamingReply`
 * holds the in-progress assistant bubble; it's committed into `messages`
 * once the stream ends.
 */
export function ChatPanel({
  courseId,
  threadId,
  messages: initialMessages,
  emptyHint,
}: {
  courseId: string;
  threadId: string;
  messages: ChatMessageItem[];
  emptyHint: string;
}) {
  const [messages, setMessages] = useState<ChatMessageItem[]>(initialMessages);
  const [input, setInput] = useState("");
  const [streamingReply, setStreamingReply] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isStreaming = streamingReply !== null;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, streamingReply]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = input.trim();

    if (!message || isStreaming) {
      return;
    }

    setError(null);
    setInput("");
    setMessages((current) => [
      ...current,
      { id: `local-${Date.now()}`, role: "user", content: message },
    ]);
    setStreamingReply("");

    try {
      const response = await fetch(`/api/courses/${courseId}/chat/${threadId}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      if (!response.ok || !response.body) {
        const text = await response.text().catch(() => "");
        throw new Error(text || "Could not get a response. Please try again.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let full = "";

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;

        full += decoder.decode(value, { stream: true });
        setStreamingReply(full);
      }

      setMessages((current) => [
        ...current,
        { id: `local-${Date.now()}-assistant`, role: "assistant", content: full },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not get a response. Please try again.");
    } finally {
      setStreamingReply(null);
    }
  }

  return (
    <div className="bg-card flex h-[28rem] flex-col rounded-2xl border border-black/5 shadow-sm">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && !isStreaming ? (
          <p className="text-muted-foreground text-sm">{emptyHint}</p>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.role === "user" ? "justify-end" : "justify-start",
              )}
            >
              <p
                className={cn(
                  "max-w-[85%] rounded-2xl px-3.5 py-2 text-sm whitespace-pre-wrap",
                  message.role === "user"
                    ? "bg-foreground text-background"
                    : "bg-muted text-foreground",
                )}
              >
                {message.content}
              </p>
            </div>
          ))
        )}
        {isStreaming ? (
          <div className="flex justify-start">
            <p className="bg-muted text-foreground max-w-[85%] rounded-2xl px-3.5 py-2 text-sm whitespace-pre-wrap">
              {streamingReply || "Thinking…"}
            </p>
          </div>
        ) : null}
        <div ref={bottomRef} />
      </div>

      {error ? (
        <p role="alert" className="text-destructive px-4 pb-1 text-xs">
          {error}
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t p-3">
        <input
          type="text"
          name="message"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask a question…"
          autoComplete="off"
          disabled={isStreaming}
          className="border-input flex-1 rounded-full border bg-transparent px-4 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        <Button type="submit" size="icon" disabled={isStreaming} aria-label="Send">
          <Send />
        </Button>
      </form>
    </div>
  );
}
