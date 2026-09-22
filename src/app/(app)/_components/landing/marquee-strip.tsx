"use client";

import { HorizontalMarquee } from "./motion";

/** Everything the workspace actually holds, as two rows sliding past each
 * other in opposite directions — the horizontal counterweight to the
 * page's vertical motion. */
const ROW_ONE = [
  { label: "Courses", tint: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-200" },
  { label: "Notes", tint: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-200" },
  { label: "Documents", tint: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-200" },
  { label: "Assignments", tint: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200" },
  { label: "Exams", tint: "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-200" },
  { label: "Topics", tint: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200" },
  { label: "AI summaries", tint: "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-200" },
  { label: "AI chat", tint: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-200" },
  { label: "Quizzes", tint: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200" },
  { label: "Flashcards", tint: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-200" },
];

const ROW_TWO = [
  { label: "Study planner", tint: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-200" },
  { label: "Calendar sync", tint: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-200" },
  { label: "Grades", tint: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200" },
  { label: "Streaks", tint: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-200" },
  { label: "Analytics", tint: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-200" },
  { label: "Resumes", tint: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-200" },
  { label: "Job tracker", tint: "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-200" },
  { label: "Cover letters", tint: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200" },
  { label: "ATS check", tint: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200" },
  { label: "Mock interviews", tint: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-200" },
];

function Pill({ label, tint }: { label: string; tint: string }) {
  return (
    <span
      className={`rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap ${tint}`}
    >
      {label}
    </span>
  );
}

export function MarqueeStrip() {
  return (
    <section
      id="workspace"
      aria-label="What lives inside the workspace"
      className="border-y bg-card/40 py-6"
    >
      <div className="space-y-3">
        <HorizontalMarquee speed={42}>
          {ROW_ONE.map((item) => (
            <Pill key={item.label} {...item} />
          ))}
        </HorizontalMarquee>
        <HorizontalMarquee speed={50} reverse>
          {ROW_TWO.map((item) => (
            <Pill key={item.label} {...item} />
          ))}
        </HorizontalMarquee>
      </div>
    </section>
  );
}
