"use client";

import { Mic, Send, Square, Volume2 } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import {
  getSpeechRecognitionConstructor,
  type SpeechRecognitionInstance,
} from "@/lib/speech-recognition";
import { cn } from "@/lib/utils";

export interface ChatMessageItem {
  id: string;
  role: string;
  content: string;
}

// Stable no-op subscribe for useSyncExternalStore below — neither browser
// capability changes after mount, so there's nothing to subscribe to.
const noopSubscribe = () => () => {};
const getSupportsSpeechRecognition = () => Boolean(getSpeechRecognitionConstructor());
const getSupportsSpeechSynthesis = () => "speechSynthesis" in window;
const getFalse = () => false;

/**
 * Fetches from a streaming message route (passed in as `endpoint`, e.g.
 * src/app/api/courses/[id]/chat/[threadId]/message/route.ts or its career-
 * chat equivalent) instead of calling a Server Action, since a Server
 * Action can only return once at the end — it can't relay Gemini's reply
 * token-by-token the way a streamed HTTP response can. `streamingReply`
 * holds the in-progress assistant bubble; it's committed into `messages`
 * once the stream ends.
 *
 * Voice input/output both use the browser's built-in Web Speech API —
 * free, zero dependencies, but Chrome/Edge-only for dictation (Firefox and
 * Safari lack `SpeechRecognition`), so the mic button only renders once
 * `supportsSpeechRecognition` is confirmed client-side.
 */
export function ChatPanel({
  endpoint,
  messages: initialMessages,
  emptyHint,
}: {
  /** The streaming message route to POST to, e.g.
   * `/api/courses/${courseId}/chat/${threadId}/message`. */
  endpoint: string;
  messages: ChatMessageItem[];
  emptyHint: string;
}) {
  const [messages, setMessages] = useState<ChatMessageItem[]>(initialMessages);
  const [input, setInput] = useState("");
  const [streamingReply, setStreamingReply] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isStreaming = streamingReply !== null;

  const [isListening, setIsListening] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  // The point of useSyncExternalStore here is purely its separate
  // server/client snapshots, which keep the server-rendered HTML and the
  // first client render in agreement (window doesn't exist during SSR, so
  // checking during render directly would be a hydration mismatch).
  const supportsSpeechRecognition = useSyncExternalStore(
    noopSubscribe,
    getSupportsSpeechRecognition,
    getFalse,
  );
  const supportsSpeechSynthesis = useSyncExternalStore(
    noopSubscribe,
    getSupportsSpeechSynthesis,
    getFalse,
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, streamingReply]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  function toggleListening() {
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const SpeechRecognitionCtor = getSpeechRecognitionConstructor();
    if (!SpeechRecognitionCtor) return;

    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setInput(transcript);
    };

    recognition.onerror = (event) => {
      setError(
        event.error === "not-allowed"
          ? "Microphone access was denied."
          : "Could not hear you — please try again.",
      );
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    setError(null);
    setIsListening(true);
    recognition.start();
  }

  function toggleSpeak(message: ChatMessageItem) {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (speakingId === message.id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message.content);
    utterance.onend = () => setSpeakingId(null);
    window.speechSynthesis.speak(utterance);
    setSpeakingId(message.id);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    recognitionRef.current?.stop();
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
      const response = await fetch(endpoint, {
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
                "flex items-end gap-1.5",
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
              {message.role === "assistant" && supportsSpeechSynthesis ? (
                <button
                  type="button"
                  onClick={() => toggleSpeak(message)}
                  aria-label={speakingId === message.id ? "Stop reading aloud" : "Read aloud"}
                  className="text-muted-foreground hover:bg-muted hover:text-foreground shrink-0 rounded-full p-1.5 transition-colors"
                >
                  {speakingId === message.id ? (
                    <Square className="size-3.5" />
                  ) : (
                    <Volume2 className="size-3.5" />
                  )}
                </button>
              ) : null}
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
          placeholder={isListening ? "Listening…" : "Ask a question…"}
          autoComplete="off"
          disabled={isStreaming}
          className="border-input flex-1 rounded-full border bg-transparent px-4 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        {supportsSpeechRecognition ? (
          <Button
            type="button"
            size="icon"
            variant={isListening ? "destructive" : "outline"}
            disabled={isStreaming}
            onClick={toggleListening}
            aria-label={isListening ? "Stop dictation" : "Dictate your question"}
          >
            <Mic />
          </Button>
        ) : null}
        <Button type="submit" size="icon" disabled={isStreaming} aria-label="Send">
          <Send />
        </Button>
      </form>
    </div>
  );
}
