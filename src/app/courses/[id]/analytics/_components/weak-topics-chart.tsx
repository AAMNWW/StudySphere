"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

export interface WeakTopicItem {
  topic: string;
  count: number;
}

export function WeakTopicsChart({ data }: { data: WeakTopicItem[] }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (data.length === 0) {
    return (
      <p className="text-muted-foreground rounded-2xl border border-dashed p-8 text-center text-sm">
        No wrong answers on a specific topic yet — nice work.
      </p>
    );
  }

  const max = Math.max(...data.map((d) => d.count));

  return (
    <ul className="space-y-2">
      {data.map((item, i) => (
        <li key={item.topic}>
          <button
            type="button"
            onMouseEnter={() => setHoverIndex(i)}
            onMouseLeave={() => setHoverIndex(null)}
            onFocus={() => setHoverIndex(i)}
            onBlur={() => setHoverIndex(null)}
            className="flex w-full items-center gap-3 rounded-lg py-1 text-left"
          >
            <span className="text-foreground w-32 shrink-0 truncate text-sm" title={item.topic}>
              {item.topic}
            </span>
            <span className="bg-muted relative h-4 flex-1 overflow-hidden rounded-full">
              <span
                className={cn(
                  "absolute inset-y-0 left-0 rounded-full transition-opacity",
                  "bg-purple-700",
                  hoverIndex === i ? "opacity-100" : "opacity-90",
                )}
                style={{ width: `${Math.max(4, (item.count / max) * 100)}%` }}
              />
            </span>
            <span className="text-muted-foreground w-6 shrink-0 text-right text-xs tabular-nums">
              {item.count}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
