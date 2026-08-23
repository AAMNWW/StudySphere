import { ComingSoonBadge } from "@/components/coming-soon-badge";
import { cn } from "@/lib/utils";

import { Reveal, RevealGroup, RevealItem } from "./reveal";

const ITEMS = [
  { label: "Subjects", live: true },
  { label: "Notes", live: true },
  { label: "Documents", live: true },
  { label: "Assignments", live: true },
  { label: "Study sessions", live: true },
  { label: "Tasks", live: false },
  { label: "Exams", live: false },
];

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
        {ITEMS.map(({ label, live }) => (
          <RevealItem key={label}>
            <span
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium",
                live
                  ? "bg-purple-100 text-purple-700"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {label}
              {!live && <ComingSoonBadge className="bg-transparent p-0" />}
            </span>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
