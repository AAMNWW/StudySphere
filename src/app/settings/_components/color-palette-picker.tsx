"use client";

import { Check } from "lucide-react";
import { useState, useTransition } from "react";

import { cn } from "@/lib/utils";
import { COLOR_PALETTE_OPTIONS, type ColorPaletteValue } from "@/lib/validations/color-palette";

import { updateColorPalette } from "../actions";

export function ColorPalettePicker({ colorPalette }: { colorPalette: ColorPaletteValue }) {
  const [selected, setSelected] = useState(colorPalette);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {COLOR_PALETTE_OPTIONS.map((option) => {
        const active = selected === option.value;

        return (
          <button
            key={option.value}
            type="button"
            disabled={isPending}
            aria-pressed={active}
            onClick={() => {
              setSelected(option.value);
              startTransition(() => {
                updateColorPalette(option.value);
              });
            }}
            className={cn(
              "flex flex-col gap-2 rounded-xl border p-3 text-left transition-colors",
              active ? "border-primary ring-primary/30 ring-2" : "hover:bg-muted/50",
            )}
          >
            <span
              className="relative flex h-10 items-center justify-end overflow-hidden rounded-lg"
              style={{
                background: `linear-gradient(135deg, ${option.swatch[0]} 0%, ${option.swatch[0]} 50%, ${option.swatch[2]} 50%, ${option.swatch[2]} 75%, ${option.swatch[1]} 75%)`,
              }}
            >
              {active ? (
                <Check className="mr-2 size-4 text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]" />
              ) : null}
            </span>
            <span>
              <span className="block text-sm font-medium">{option.label}</span>
              <span className="text-muted-foreground block text-xs">{option.description}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
