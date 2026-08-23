"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

export interface DifficultyBreakdownItem {
  difficulty: string;
  label: string;
  correct: number;
  total: number;
}

const CHART_HEIGHT = 140;

export function DifficultyBreakdownChart({ data }: { data: DifficultyBreakdownItem[] }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const attempted = data.filter((d) => d.total > 0);

  if (attempted.length === 0) {
    return (
      <p className="text-muted-foreground rounded-2xl border border-dashed p-8 text-center text-sm">
        No quiz attempts yet.
      </p>
    );
  }

  return (
    <div className="flex items-end gap-4" style={{ height: CHART_HEIGHT + 40 }}>
      {data.map((item, i) => {
        const hasData = item.total > 0;
        const pct = hasData ? Math.round((item.correct / item.total) * 100) : 0;
        const barHeight = hasData ? Math.max(6, (pct / 100) * CHART_HEIGHT) : 0;
        const isZero = hasData && pct === 0;

        return (
          <div key={item.difficulty} className="flex flex-1 flex-col items-center gap-1.5">
            <div
              className="relative flex w-full items-end justify-center"
              style={{ height: CHART_HEIGHT }}
            >
              {hasData ? (
                <span
                  className={cn(
                    "absolute -top-5 text-xs font-semibold tabular-nums",
                    isZero ? "text-destructive" : "text-foreground",
                  )}
                >
                  {pct}%
                </span>
              ) : null}
              <button
                type="button"
                disabled={!hasData}
                onMouseEnter={() => hasData && setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
                onFocus={() => hasData && setHoverIndex(i)}
                onBlur={() => setHoverIndex(null)}
                className={cn(
                  "w-full max-w-6 rounded-t-md transition-opacity",
                  !hasData && "bg-muted",
                  hasData && !isZero && "bg-purple-700",
                  isZero && "bg-destructive",
                  hoverIndex === i && "opacity-80",
                )}
                style={{ height: hasData ? barHeight : 4 }}
              />
              {hoverIndex === i ? (
                <div className="bg-popover text-popover-foreground pointer-events-none absolute bottom-full mb-1 rounded-xl border border-black/5 px-2.5 py-1.5 text-xs whitespace-nowrap shadow-lg">
                  <p className="font-semibold">
                    {item.correct}/{item.total} correct
                  </p>
                </div>
              ) : null}
            </div>
            <span className="text-muted-foreground text-xs">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}
