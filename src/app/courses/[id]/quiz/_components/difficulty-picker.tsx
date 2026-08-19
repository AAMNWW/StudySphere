"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

const DIFFICULTIES = [
  { value: "EASY", label: "Easy" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HARD", label: "Hard" },
  { value: "PRO", label: "Pro" },
  { value: "MASTER", label: "Master" },
] as const;

export function DifficultyPicker({ defaultValue = "MEDIUM" }: { defaultValue?: string }) {
  const [value, setValue] = useState(defaultValue);

  return (
    <div role="radiogroup" aria-label="Difficulty" className="flex flex-wrap gap-1.5">
      {DIFFICULTIES.map((difficulty) => (
        <label
          key={difficulty.value}
          className={cn(
            "cursor-pointer rounded-full border px-3 py-1 text-sm font-medium transition-colors",
            value === difficulty.value
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border hover:bg-muted",
          )}
        >
          <input
            type="radio"
            name="difficulty"
            value={difficulty.value}
            checked={value === difficulty.value}
            onChange={() => setValue(difficulty.value)}
            className="sr-only"
          />
          {difficulty.label}
        </label>
      ))}
    </div>
  );
}
