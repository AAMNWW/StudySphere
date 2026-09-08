"use client";

import { Sparkles } from "lucide-react";
import { useRef, useState, useTransition } from "react";

import { DocumentMultiSelect, type SelectableDocument } from "@/components/document-multi-select";
import { Button } from "@/components/ui/button";
import type { SuggestedTopic } from "@/lib/ai/suggest-topics";

import { addSuggestedTopics, suggestTopics } from "../actions";

export function SuggestTopicsPanel({
  courseId,
  documents,
}: {
  courseId: string;
  documents: SelectableDocument[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [suggestions, setSuggestions] = useState<SuggestedTopic[] | null>(null);
  const [added, setAdded] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [isSuggesting, startSuggestTransition] = useTransition();
  const [isSaving, startSaveTransition] = useTransition();

  function suggest() {
    setError(null);
    const documentIds = formRef.current
      ? new FormData(formRef.current).getAll("documentIds").map(String)
      : [];

    startSuggestTransition(async () => {
      const result = await suggestTopics(courseId, documentIds);

      if (result.status === "error") {
        setError(result.message);
        return;
      }

      setSuggestions(result.topics);
      setAdded(new Set());
    });
  }

  function addOne(index: number, topic: SuggestedTopic) {
    startSaveTransition(async () => {
      await addSuggestedTopics(courseId, [topic]);
      setAdded((current) => new Set(current).add(index));
    });
  }

  function addAll() {
    if (!suggestions) return;
    const remaining = suggestions.filter((_, index) => !added.has(index));
    startSaveTransition(async () => {
      await addSuggestedTopics(courseId, remaining);
      setAdded(new Set(suggestions.map((_, index) => index)));
    });
  }

  return (
    <div className="space-y-4">
      {/* Not an actual submit form — just a container we read via FormData
          on demand, since the AI suggest call and the per-item "Add" both
          need the checked document ids without a real form submission. */}
      <form ref={formRef} onSubmit={(event) => event.preventDefault()}>
        <DocumentMultiSelect documents={documents} />
      </form>

      <Button type="button" onClick={suggest} disabled={isSuggesting}>
        <Sparkles />
        {isSuggesting ? "Thinking…" : "Suggest topics with AI"}
      </Button>

      {error ? (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      ) : null}

      {suggestions && suggestions.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-sm">
              {suggestions.length} suggestion{suggestions.length === 1 ? "" : "s"}
            </p>
            <Button type="button" size="sm" variant="outline" onClick={addAll} disabled={isSaving}>
              Add all
            </Button>
          </div>
          <ul className="space-y-2">
            {suggestions.map((topic, index) => (
              <li
                key={index}
                className="bg-card flex items-start justify-between gap-3 rounded-xl border border-black/5 p-3"
              >
                <div>
                  <p className="text-sm font-medium">{topic.title}</p>
                  <p className="text-muted-foreground text-sm">{topic.description}</p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={added.has(index) || isSaving}
                  onClick={() => addOne(index, topic)}
                >
                  {added.has(index) ? "Added" : "Add"}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
