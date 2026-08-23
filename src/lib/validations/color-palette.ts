import { z } from "zod";

import { ColorPalette } from "@/generated/prisma/enums";

export const colorPaletteSchema = z.enum(ColorPalette);

export type ColorPaletteValue = z.infer<typeof colorPaletteSchema>;

/** Preview swatches use the exact same oklch() values as the CSS overrides
 * in globals.css (light-mode ones), so the picker matches what you get. */
export const COLOR_PALETTE_OPTIONS: {
  value: ColorPaletteValue;
  label: string;
  description: string;
  swatch: [string, string, string];
}[] = [
  {
    value: "GRAPHITE",
    label: "Graphite",
    description: "The original, no-frills look.",
    swatch: ["oklch(0.975 0.01 90)", "oklch(0.205 0 0)", "oklch(0.95 0.012 85)"],
  },
  {
    value: "HELLO_KITTY",
    label: "Hello Kitty",
    description: "Pastel pink with a bold red bow.",
    swatch: ["oklch(0.97 0.02 350)", "oklch(0.55 0.22 15)", "oklch(0.9 0.05 350)"],
  },
  {
    value: "SPIDER_MAN",
    label: "Spider-Man",
    description: "Web-slinger red and blue.",
    swatch: ["oklch(0.97 0.01 250)", "oklch(0.5 0.21 25)", "oklch(0.55 0.16 250)"],
  },
  {
    value: "GALAXY",
    label: "Galaxy",
    description: "Deep indigo with a starry night mode.",
    swatch: ["oklch(0.95 0.02 290)", "oklch(0.5 0.22 295)", "oklch(0.72 0.16 320)"],
  },
  {
    value: "OCEAN",
    label: "Ocean",
    description: "Calm blues and sea-glass teal.",
    swatch: ["oklch(0.96 0.02 210)", "oklch(0.5 0.14 220)", "oklch(0.75 0.12 190)"],
  },
  {
    value: "FOREST",
    label: "Forest",
    description: "Earthy greens and warm tan.",
    swatch: ["oklch(0.96 0.02 120)", "oklch(0.48 0.14 145)", "oklch(0.8 0.06 80)"],
  },
];
