import { z } from "zod";

import { AccentColor } from "@/generated/prisma/enums";

export const accentColorSchema = z.enum(AccentColor);

export type AccentColorValue = z.infer<typeof accentColorSchema>;

export const ACCENT_COLOR_OPTIONS: { value: AccentColorValue; label: string; swatchClassName: string }[] = [
  { value: "GRAPHITE", label: "Graphite", swatchClassName: "bg-neutral-500" },
  { value: "PURPLE", label: "Purple", swatchClassName: "bg-purple-500" },
  { value: "BLUE", label: "Blue", swatchClassName: "bg-sky-500" },
  { value: "GREEN", label: "Green", swatchClassName: "bg-emerald-500" },
  { value: "ORANGE", label: "Orange", swatchClassName: "bg-orange-500" },
  { value: "PINK", label: "Pink", swatchClassName: "bg-pink-500" },
];
