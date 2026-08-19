import { ArrowRight, CalendarX, FolderOpen, ListX, NotebookPen, Puzzle } from "lucide-react";

import { RevealGroup, RevealItem } from "./reveal";

const PROBLEMS = [
  { text: "Notes in one place", icon: NotebookPen },
  { text: "Assignments somewhere else", icon: ListX },
  { text: "PDFs scattered across folders", icon: FolderOpen },
  { text: "Deadlines forgotten", icon: CalendarX },
  { text: "Too many separate AI tools", icon: Puzzle },
];

export function ProblemSection() {
  return (
    <section id="problem" className="mx-auto w-full max-w-4xl px-6 py-16">
      <RevealGroup className="text-center" stagger={0.08}>
        <RevealItem>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Sound familiar?
          </h2>
        </RevealItem>
        <RevealItem>
          <ul className="mx-auto mt-8 grid max-w-xl gap-3">
            {PROBLEMS.map(({ text, icon: Icon }) => (
              <li
                key={text}
                className="bg-card flex items-center gap-3 rounded-xl border border-black/5 px-4 py-3 text-left shadow-sm"
              >
                <Icon className="text-destructive/70 size-4 shrink-0" />
                <span className="text-sm font-medium">{text}</span>
              </li>
            ))}
          </ul>
        </RevealItem>
        <RevealItem className="mt-8 flex items-center justify-center gap-2 text-sm font-medium">
          <span>StudySphere brings it all into one workspace</span>
          <ArrowRight className="size-4" />
        </RevealItem>
      </RevealGroup>
    </section>
  );
}
