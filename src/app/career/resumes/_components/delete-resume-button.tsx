"use client";

import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import { deleteResume } from "../actions";

export function DeleteResumeButton({
  resumeId,
  resumeTitle,
}: {
  resumeId: string;
  resumeTitle: string;
}) {
  return (
    <form
      action={deleteResume.bind(null, resumeId)}
      onSubmit={(event) => {
        if (!window.confirm(`Delete "${resumeTitle}"? This cannot be undone.`)) {
          event.preventDefault();
        }
      }}
    >
      <Button type="submit" variant="ghost" size="icon-sm" aria-label={`Delete ${resumeTitle}`}>
        <Trash2 />
      </Button>
    </form>
  );
}
