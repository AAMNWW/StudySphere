"use client";

import { useTheme } from "next-themes";

import { useMounted } from "@/lib/use-mounted";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  // next-themes only knows the real theme after mount (it reads
  // localStorage/matchMedia client-side) — rendering before that would
  // either guess wrong or mismatch the server-rendered HTML, so the pills
  // stay visually neutral until mounted.
  const mounted = useMounted();

  return (
    <div className="flex gap-2 text-sm">
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => setTheme(option.value)}
          className={cn(
            "rounded-full border px-3 py-1",
            mounted && theme === option.value
              ? "border-primary bg-primary text-primary-foreground"
              : "hover:bg-muted",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
