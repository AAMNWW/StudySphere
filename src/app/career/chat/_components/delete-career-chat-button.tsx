"use client";

import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import { deleteCareerChatThread } from "../actions";

export function DeleteCareerChatButton({
  threadId,
  threadLabel,
}: {
  threadId: string;
  threadLabel: string;
}) {
  return (
    <form
      action={deleteCareerChatThread.bind(null, threadId)}
      onSubmit={(event) => {
        if (!window.confirm(`Delete "${threadLabel}"? This cannot be undone.`)) {
          event.preventDefault();
        }
      }}
    >
      <Button type="submit" variant="ghost" size="icon-sm" aria-label={`Delete ${threadLabel}`}>
        <Trash2 />
      </Button>
    </form>
  );
}
