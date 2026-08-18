import { cn } from "@/lib/utils";

// Pastel tile colors, cycled across dashboard/course UI the same way
// StudyFetch color-codes its feature tiles (study tools in lavender, chat in
// pink, practice in green, media in blue, utilities in neutral gray).
const TILE_COLORS = {
  purple: "bg-purple-100 text-purple-700",
  yellow: "bg-amber-100 text-amber-700",
  green: "bg-emerald-100 text-emerald-700",
  blue: "bg-sky-100 text-sky-700",
  pink: "bg-pink-100 text-pink-700",
  red: "bg-red-100 text-red-700",
  gray: "bg-slate-100 text-slate-700",
} as const;

export type IconTileColor = keyof typeof TILE_COLORS;

/** Cycled across a list of same-kind items (course cards, etc.) so each gets a distinct accent. */
export const ICON_TILE_COLOR_CYCLE: IconTileColor[] = [
  "purple",
  "yellow",
  "green",
  "blue",
  "pink",
];

export function IconTile({
  color,
  size = "default",
  className,
  children,
}: {
  color: IconTileColor;
  size?: "default" | "sm";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-xl",
        size === "sm" ? "size-8" : "size-10",
        TILE_COLORS[color],
        className,
      )}
    >
      {children}
    </div>
  );
}
