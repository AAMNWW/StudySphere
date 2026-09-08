"use client";

import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import { deleteNote } from "../actions";

export function DeleteNoteButton({
  courseId,
  noteId,
  noteTitle,
}: {
  courseId: string;
  noteId: string;
  noteTitle: string;
}) {
  return (
    <form
      action={deleteNote.bind(null, courseId, noteId)}
      onSubmit={(event) => {
        if (!window.confirm(`Delete "${noteTitle}"? This cannot be undone.`)) {
          event.preventDefault();
        }
      }}
    >
      <Button
        type="submit"
        variant="ghost"
        size="icon-sm"
        aria-label={`Delete ${noteTitle}`}
      >
        <Trash2 />
      </Button>
    </form>
  );
}
