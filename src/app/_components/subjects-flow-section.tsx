import { ChevronRight } from "lucide-react";

import { ComingSoonBadge } from "@/components/coming-soon-badge";
import { cn } from "@/lib/utils";

import { Reveal } from "./reveal";

const NODES = [
  { label: "Subject", live: true },
  { label: "Notes", live: true },
  { label: "Documents", live: true },
  { label: "Assignments", live: true },
  { label: "AI summary", live: true },
  { label: "Progress", live: false },
];

export function SubjectsFlowSection() {
  return (
    <section id="subjects" className="mx-auto w-full max-w-4xl px-6 py-16 text-center">
      <Reveal>
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Your subjects, organized
        </h2>
        <p className="text-muted-foreground mx-auto mt-3 max-w-md text-sm">
          Every course follows the same simple structure.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-1.5">
          {NODES.map((node, index) => (
            <div key={node.label} className="flex items-center gap-1.5">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium",
                  node.live
                    ? "bg-purple-100 text-purple-700"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {node.label}
                {!node.live && <ComingSoonBadge className="bg-transparent p-0" />}
              </span>
              {index < NODES.length - 1 && (
                <ChevronRight className="text-muted-foreground/40 size-4 shrink-0" />
              )}
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
