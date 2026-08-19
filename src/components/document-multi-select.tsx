"use client";

import { FileText } from "lucide-react";
import { useId, useState } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { MAX_SELECTABLE_DOCUMENTS } from "@/lib/generation-limits";
import { cn } from "@/lib/utils";

export interface SelectableDocument {
  id: string;
  fileName: string;
}

/**
 * Checkbox list of a course's documents, posted as `formData.getAll(name)`.
 * Shared by every "generate" form (quiz, flashcards, chat, AI topics) that
 * needs the student to pick which uploaded files to ground the request in.
 */
export function DocumentMultiSelect({
  name = "documentIds",
  documents,
  defaultSelectedIds = [],
  error,
}: {
  name?: string;
  documents: SelectableDocument[];
  defaultSelectedIds?: string[];
  error?: string;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set(defaultSelectedIds));
  const groupId = useId();

  if (documents.length === 0) {
    return (
      <p className="text-muted-foreground rounded-lg border border-dashed p-4 text-sm">
        Upload a document to this course first.
      </p>
    );
  }

  function toggle(id: string, checked: boolean) {
    setSelected((current) => {
      const next = new Set(current);
      if (checked) {
        if (next.size >= MAX_SELECTABLE_DOCUMENTS) {
          return current;
        }
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }

  return (
    <div className="space-y-2" role="group" aria-labelledby={groupId}>
      <p id={groupId} className="text-muted-foreground text-xs">
        Choose up to {MAX_SELECTABLE_DOCUMENTS} documents ({selected.size} selected)
      </p>
      <ul className="max-h-56 space-y-1 overflow-y-auto rounded-lg border p-2">
        {documents.map((document) => {
          const checked = selected.has(document.id);
          const disabled = !checked && selected.size >= MAX_SELECTABLE_DOCUMENTS;
          const inputId = `${groupId}-${document.id}`;

          return (
            <li key={document.id}>
              <Label
                htmlFor={inputId}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm",
                  disabled ? "opacity-50" : "hover:bg-muted cursor-pointer",
                )}
              >
                <Checkbox
                  id={inputId}
                  name={name}
                  value={document.id}
                  checked={checked}
                  disabled={disabled}
                  onCheckedChange={(value) => toggle(document.id, value === true)}
                />
                <FileText className="text-muted-foreground size-3.5 shrink-0" />
                <span className="truncate">{document.fileName}</span>
              </Label>
            </li>
          );
        })}
      </ul>
      {error ? (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      ) : null}
    </div>
  );
}
