"use client";

import { Send } from "lucide-react";
import { useActionState, useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import {
  initialAsyncActionFormState,
  type AsyncActionFormState,
} from "../async-action-state";

export interface ChatMessageItem {
  id: string;
  role: string;
  content: string;
}

export function ChatPanel({
  messages,
  action,
  emptyHint,
}: {
  messages: ChatMessageItem[];
  action: (
    previousState: AsyncActionFormState,
    formData: FormData,
  ) => Promise<AsyncActionFormState>;
  emptyHint: string;
}) {
  const [state, formAction, isPending] = useActionState(
    action,
    initialAsyncActionFormState,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, isPending]);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.submission, state.status]);

  return (
    <div className="bg-card flex h-[28rem] flex-col rounded-2xl border border-black/5 shadow-sm">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 ? (
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
        {isPending ? (
          <div className="flex justify-start">
            <p className="bg-muted text-muted-foreground rounded-2xl px-3.5 py-2 text-sm">
              Thinking…
            </p>
          </div>
        ) : null}
        <div ref={bottomRef} />
      </div>

      {state.status === "error" && state.message ? (
        <p role="alert" className="text-destructive px-4 pb-1 text-xs">
          {state.message}
        </p>
      ) : null}

      <form
        ref={formRef}
        action={formAction}
        className="flex items-center gap-2 border-t p-3"
      >
        <input
          type="text"
          name="message"
          placeholder="Ask a question…"
          autoComplete="off"
          disabled={isPending}
          className="border-input flex-1 rounded-full border bg-transparent px-4 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        <Button type="submit" size="icon" disabled={isPending} aria-label="Send">
          <Send />
        </Button>
      </form>
    </div>
  );
}
