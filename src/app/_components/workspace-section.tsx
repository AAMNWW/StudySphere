import { getTileColorClasses, ICON_TILE_COLOR_CYCLE } from "@/components/icon-tile";
import { cn } from "@/lib/utils";

import { Reveal, RevealGroup, RevealItem } from "./reveal";

const ITEMS = ["Subjects", "Notes", "Documents", "Assignments", "Exams", "Tasks", "Study sessions"];

export function WorkspaceSection() {
  return (
    <section id="workspace" className="mx-auto w-full max-w-4xl px-6 py-16 text-center">
      <Reveal>
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          One workspace for everything
        </h2>
        <p className="text-muted-foreground mx-auto mt-3 max-w-lg text-sm">
          Every subject you&apos;re studying, and everything that goes with it, in
          a single place.
        </p>
      </Reveal>

      <RevealGroup className="mt-8 flex flex-wrap items-center justify-center gap-3" stagger={0.05}>
        {ITEMS.map((label, index) => (
          <RevealItem key={label}>
            <span
              className={cn(
                "inline-block rounded-full px-4 py-2 text-sm font-medium transition-transform duration-200 hover:-translate-y-0.5 hover:scale-105",
                getTileColorClasses(ICON_TILE_COLOR_CYCLE[index % ICON_TILE_COLOR_CYCLE.length]),
              )}
            >
              {label}
            </span>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
