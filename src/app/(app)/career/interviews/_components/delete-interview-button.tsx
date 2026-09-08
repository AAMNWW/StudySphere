"use client";

import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import { deleteInterviewSession } from "../actions";

export function DeleteInterviewButton({
  sessionId,
  sessionLabel,
}: {
  sessionId: string;
  sessionLabel: string;
}) {
  return (
    <form
      action={deleteInterviewSession.bind(null, sessionId)}
      onSubmit={(event) => {
        if (!window.confirm(`Delete "${sessionLabel}"? This cannot be undone.`)) {
          event.preventDefault();
        }
      }}
    >
      <Button type="submit" variant="ghost" size="icon-sm" aria-label={`Delete ${sessionLabel}`}>
        <Trash2 />
      </Button>
    </form>
  );
}
