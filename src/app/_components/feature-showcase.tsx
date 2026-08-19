"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  Check,
  Clock,
  FileText,
  ListTodo,
  Sparkles,
  StickyNote,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { MotionPop } from "./reveal";

type TabKey = "courses" | "notes" | "assignments" | "documents";

const TAB_STYLES: Record<TabKey, { bg: string; stack: [string, string]; chip: string }> = {
  courses: { bg: "bg-purple-100", stack: ["bg-purple-200", "bg-amber-100"], chip: "bg-purple-200 text-purple-700" },
  notes: { bg: "bg-amber-100", stack: ["bg-amber-200", "bg-pink-100"], chip: "bg-amber-200 text-amber-700" },
  assignments: { bg: "bg-emerald-100", stack: ["bg-emerald-200", "bg-sky-100"], chip: "bg-emerald-200 text-emerald-700" },
  documents: { bg: "bg-pink-100", stack: ["bg-pink-200", "bg-purple-100"], chip: "bg-pink-200 text-pink-700" },
};

const TABS: {
  key: TabKey;
  label: string;
  icon: typeof BookOpen;
  eyebrow: string;
  heading: string;
  description: string;
}[] = [
  {
    key: "courses",
    label: "Courses",
    icon: BookOpen,
    eyebrow: "Courses",
    heading: "Every subject gets its own space",
    description:
      "Create a course for whatever you're studying, and every note, assignment and document you add lives right inside it.",
  },
  {
    key: "notes",
    label: "Notes",
    icon: StickyNote,
    eyebrow: "Notes",
    heading: "Jot it down, edit it inline",
    description:
      "Write notes as you study and edit them in place, right where they sit next to the rest of the course.",
  },
  {
    key: "assignments",
    label: "Assignments",
    icon: ListTodo,
    eyebrow: "Assignments",
    heading: "Know what's due, and what's overdue",
    description:
      "Add due dates and check things off as you finish. Anything overdue is flagged automatically so it doesn't slip by.",
  },
  {
    key: "documents",
    label: "AI summaries",
    icon: Sparkles,
    eyebrow: "Documents",
    heading: "Upload it, then let AI summarize it",
    description:
      "Attach PDFs, Word docs and slides to a course, then generate a plain-language summary in a couple of clicks.",
  },
];

function TabMock({ tab }: { tab: TabKey }) {
  if (tab === "courses") {
    return (
      <ul className="space-y-2">
        {[
          { title: "Linear Algebra", color: "bg-purple-400" },
          { title: "Organic Chemistry", color: "bg-emerald-400" },
          { title: "World History", color: "bg-sky-400" },
        ].map((course) => (
          <li
            key={course.title}
            className="flex items-center gap-3 rounded-xl border border-black/5 px-3 py-2.5"
          >
            <span className={cn("size-2.5 shrink-0 rounded-full", course.color)} />
            <span className="text-sm font-medium">{course.title}</span>
          </li>
        ))}
      </ul>
    );
  }

  if (tab === "notes") {
    return (
      <div className="rounded-xl border border-black/5 p-3">
        <p className="text-sm font-medium">Chapter 4 — Kinetics</p>
        <div className="mt-2 space-y-1.5">
          <div className="bg-muted h-2 w-full rounded-full" />
          <div className="bg-muted h-2 w-5/6 rounded-full" />
          <div className="bg-muted h-2 w-3/4 rounded-full" />
        </div>
      </div>
    );
  }

  if (tab === "assignments") {
    return (
      <ul className="space-y-2">
        {[
          { title: "Problem set 6", due: "Tomorrow", overdue: false },
          { title: "Lab report", due: "3 days ago", overdue: true },
          { title: "Reading response", due: "Fri", overdue: false },
        ].map((item) => (
          <li
            key={item.title}
            className="flex items-center justify-between rounded-xl border border-black/5 px-3 py-2.5"
          >
            <span className="flex items-center gap-2 text-sm font-medium">
              <span
                className={cn(
                  "flex size-4 items-center justify-center rounded-full border",
                  item.overdue ? "border-red-300" : "border-emerald-300 bg-emerald-100",
                )}
              >
                {!item.overdue && <Check className="size-2.5 text-emerald-700" />}
              </span>
              {item.title}
            </span>
            <span
              className={cn(
                "flex items-center gap-1 text-xs",
                item.overdue ? "text-destructive" : "text-muted-foreground",
              )}
            >
              <Clock className="size-3" />
              {item.due}
            </span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="rounded-xl border border-black/5 p-3">
      <div className="flex items-center gap-2">
        <FileText className="text-muted-foreground size-4" />
        <p className="text-sm font-medium">Lecture-12-slides.pdf</p>
      </div>
      <p className="text-muted-foreground mt-2 flex items-center gap-1 text-xs">
        <Sparkles className="size-3" /> Summary
      </p>
      <div className="mt-1.5 space-y-1.5">
        <div className="bg-muted h-2 w-full rounded-full" />
        <div className="bg-muted h-2 w-2/3 rounded-full" />
      </div>
    </div>
  );
}

export function FeatureShowcase() {
  const [active, setActive] = useState<TabKey>("courses");
  const activeTab = TABS.find((tab) => tab.key === active) ?? TABS[0];
  const styles = TAB_STYLES[active];

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActive(tab.key)}
            className={cn(
              "relative flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              active === tab.key
                ? "text-background"
                : "text-muted-foreground hover:bg-muted",
            )}
          >
            {active === tab.key && (
              <motion.span
                layoutId="active-tab-pill"
                className="bg-foreground absolute inset-0 -z-10 rounded-full"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <tab.icon className="size-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="relative mt-8">
        <motion.div
          aria-hidden
          className={cn("absolute inset-4 -z-10 rounded-3xl", styles.stack[0])}
          animate={{ rotate: [-2, -4, -2] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          aria-hidden
          className={cn("absolute inset-4 -z-20 rounded-3xl", styles.stack[1])}
          animate={{ rotate: [2, 4, 2] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />

        <div
          className={cn(
            "grid gap-8 overflow-hidden rounded-3xl p-8 transition-colors duration-300 sm:grid-cols-2 sm:p-10",
            styles.bg,
          )}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              className="flex flex-col justify-center"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <span
                className={cn(
                  "mb-3 inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                  styles.chip,
                )}
              >
                {activeTab.eyebrow}
              </span>
              <h3 className="text-2xl font-bold tracking-tight text-balance">
                {activeTab.heading}
              </h3>
              <p className="text-foreground/70 mt-3 text-sm">
                {activeTab.description}
              </p>
              <div className="mt-6 flex gap-3">
                <MotionPop>
                  <Button
                    nativeButton={false}
                    render={<Link href="/signup">Get started</Link>}
                  />
                </MotionPop>
                <MotionPop>
                  <Button
                    variant="outline"
                    nativeButton={false}
                    render={<Link href="/login">Learn more</Link>}
                  />
                </MotionPop>
              </div>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              className="bg-card rounded-2xl border border-black/5 p-4 shadow-sm"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <TabMock tab={active} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
