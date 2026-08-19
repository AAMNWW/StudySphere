"use client";

import { Pencil } from "lucide-react";
import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import type { NoteModel } from "@/generated/prisma/models";

import { updateNote } from "../actions";
import { initialNoteFormState } from "../note-form-state";
import { DeleteNoteButton } from "./delete-note-button";
import { NoteContent } from "./note-content";

// Fixed locale and time zone so the server always renders the same string a
// user would see, regardless of where the server happens to run.
const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeZone: "UTC",
});

export function NoteCard({
  courseId,
  note,
}: {
  courseId: string;
  note: NoteModel;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [state, formAction, isPending] = useActionState(
    updateNote.bind(null, courseId, note.id),
    {
      ...initialNoteFormState,
      values: { title: note.title, content: note.content ?? "" },
    },
  );

  // Drop back into the read view once a save succeeds, rather than making
  // the user close the form themselves. Adjusting state during render (per
  // https://react.dev/learn/you-might-not-need-an-effect) instead of an
  // effect avoids an extra render pass.
  const [handledSubmission, setHandledSubmission] = useState(
    state.submission,
  );
  if (
    isEditing &&
    state.status === "success" &&
    state.submission !== handledSubmission
  ) {
    setHandledSubmission(state.submission);
    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <Card>
        <CardContent>
          <form
            key={state.submission}
            action={formAction}
            className="space-y-4"
            noValidate
          >
            <div className="space-y-2">
              <Label htmlFor={`note-title-${note.id}`}>Title</Label>
              <Input
                id={`note-title-${note.id}`}
                name="title"
                defaultValue={state.values?.title}
                maxLength={100}
                aria-invalid={Boolean(state.errors?.title)}
              />
              {state.errors?.title ? (
                <p className="text-destructive text-sm">
                  {state.errors.title[0]}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor={`note-content-${note.id}`}>
                Content (optional)
              </Label>
              <RichTextEditor
                id={`note-content-${note.id}`}
                name="content"
                defaultValue={state.values?.content}
                ariaInvalid={Boolean(state.errors?.content)}
              />
              {state.errors?.content ? (
                <p className="text-destructive text-sm">
                  {state.errors.content[0]}
                </p>
              ) : null}
            </div>

            {state.message ? (
              <p role="alert" className="text-destructive text-sm">
                {state.message}
              </p>
            ) : null}

            <div className="flex gap-2">
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving…" : "Save"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{note.title}</CardTitle>
        <p className="text-muted-foreground mt-1 text-xs">
          Added {dateFormatter.format(note.createdAt)}
        </p>
        <CardAction className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Edit ${note.title}`}
            onClick={() => setIsEditing(true)}
          >
            <Pencil />
          </Button>
          <DeleteNoteButton
            courseId={courseId}
            noteId={note.id}
            noteTitle={note.title}
          />
        </CardAction>
      </CardHeader>
      {note.content ? (
        <CardContent>
          <NoteContent content={note.content} />
        </CardContent>
      ) : null}
    </Card>
  );
}
