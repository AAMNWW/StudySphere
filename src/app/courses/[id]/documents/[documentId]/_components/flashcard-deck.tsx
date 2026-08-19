"use client";

import { ChevronLeft, ChevronRight, RotateCw } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

interface FlashcardItem {
  id: string;
  front: string;
  back: string;
  order: number;
}

export function FlashcardDeck({ cards }: { cards: FlashcardItem[] }) {
  const sorted = cards.slice().sort((a, b) => a.order - b.order);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const card = sorted[index];

  function go(delta: number) {
    setFlipped(false);
    setIndex((current) => Math.min(Math.max(current + delta, 0), sorted.length - 1));
  }

  if (!card) {
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        type="button"
        onClick={() => setFlipped((value) => !value)}
        aria-label="Flip card"
        className="bg-card flex h-56 w-full max-w-md items-center justify-center rounded-2xl border border-black/5 p-6 text-center shadow-sm transition-colors hover:bg-muted/40"
      >
        <div>
          <p className="text-muted-foreground mb-3 flex items-center justify-center gap-1.5 text-xs font-medium tracking-wide uppercase">
            <RotateCw className="size-3.5" />
            {flipped ? "Answer" : "Term"}
          </p>
          <p className="text-lg font-medium">{flipped ? card.back : card.front}</p>
        </div>
      </button>

      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={index === 0}
          onClick={() => go(-1)}
          aria-label="Previous card"
        >
          <ChevronLeft />
        </Button>
        <p className="text-muted-foreground text-sm">
          {index + 1} / {sorted.length}
        </p>
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={index === sorted.length - 1}
          onClick={() => go(1)}
          aria-label="Next card"
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
