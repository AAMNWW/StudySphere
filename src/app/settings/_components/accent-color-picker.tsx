"use client";

import { useState, useTransition } from "react";

import { ACCENT_COLOR_OPTIONS, type AccentColorValue } from "@/lib/validations/accent-color";
import { cn } from "@/lib/utils";

import { updateAccentColor } from "../actions";

export function AccentColorPicker({ accentColor }: { accentColor: AccentColorValue }) {
  const [selected, setSelected] = useState(accentColor);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap gap-3">
      {ACCENT_COLOR_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          disabled={isPending}
          aria-pressed={selected === option.value}
          aria-label={option.label}
          title={option.label}
          onClick={() => {
            setSelected(option.value);
            startTransition(() => {
              updateAccentColor(option.value);
            });
          }}
          className={cn(
            "flex size-9 items-center justify-center rounded-full transition-transform",
            selected === option.value
              ? "ring-2 ring-offset-2 ring-offset-background ring-foreground"
              : "hover:scale-105",
          )}
        >
          <span className={cn("size-6 rounded-full", option.swatchClassName)} />
        </button>
      ))}
    </div>
  );
}
