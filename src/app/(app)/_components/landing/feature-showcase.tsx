"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  Check,
  Clock,
  FileText,
  Layers3,
  MessageCircle,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { cn } from "@/lib/utils";

import { EASE, PulseDot, Rise, TypingDots, WritingBar, useStill } from "./motion";
import { CtaButton, SectionHeading } from "./ui";

type FeatureKey = "courses" | "material" | "deadlines" | "chat" | "practice";

const FEATURES: {
  key: FeatureKey;
  label: string;
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  tint: string;
  /** The two tinted cards stacked behind the panel. */
  stack: [string, string];
}[] = [
  {
    key: "courses",
    label: "Courses",
    eyebrow: "One space per subject",
    title: "Every subject gets its own workspace",
    description:
      "Create a course for anything you're studying. Its notes, documents, assignments, exams and topics all live inside it, never in a folder you have to go hunting for.",
    icon: BookOpen,
    tint: "bg-purple-100 dark:bg-purple-950/40",
    stack: ["bg-purple-200 dark:bg-purple-900/40", "bg-amber-100 dark:bg-amber-950/40"],
  },
  {
    key: "material",
    label: "Notes & documents",
    eyebrow: "Write it, upload it, summarise it",
    title: "Your material, with the gist already written",
    description:
      "Write notes inline as you study, and upload the PDFs, Word docs and slide decks that go with them. Ask for a plain-language summary of any upload in a couple of clicks.",
    icon: FileText,
    tint: "bg-amber-100 dark:bg-amber-950/40",
    stack: ["bg-amber-200 dark:bg-amber-900/40", "bg-pink-100 dark:bg-pink-950/40"],
  },
  {
    key: "deadlines",
    label: "Assignments & exams",
    eyebrow: "Nothing slips",
    title: "Know what's due, and what's already late",
    description:
      "Add due dates, tick things off, and keep exam dates beside the course they belong to. Anything overdue is flagged for you on the dashboard automatically.",
    icon: Clock,
    tint: "bg-emerald-100 dark:bg-emerald-950/40",
    stack: ["bg-emerald-200 dark:bg-emerald-900/40", "bg-sky-100 dark:bg-sky-950/40"],
  },
  {
    key: "chat",
    label: "AI chat",
    eyebrow: "Grounded in your own material",
    title: "Ask your documents a question",
    description:
      "Chat with an uploaded document and get answers drawn from what's actually in it, or ask the course tutor a general question when your material doesn't cover it.",
    icon: MessageCircle,
    tint: "bg-sky-100 dark:bg-sky-950/40",
    stack: ["bg-sky-200 dark:bg-sky-900/40", "bg-purple-100 dark:bg-purple-950/40"],
  },
  {
    key: "practice",
    label: "Quizzes & flashcards",
    eyebrow: "Practice, not re-reading",
    title: "Turn a reading into a test of it",
    description:
      "Generate a multiple-choice quiz or a flashcard set from your own course material, then review until it sticks. Your history is kept so you can see what improved.",
    icon: Layers3,
    tint: "bg-pink-100 dark:bg-pink-950/40",
    stack: ["bg-pink-200 dark:bg-pink-900/40", "bg-emerald-100 dark:bg-emerald-950/40"],
  },
];

/** Every mock is the compact card it was before — a colored dot, a filename,
 * a couple of skeleton lines — except now nothing in them sits still: the
 * summary writes itself, the checkbox ticks, the tutor keeps typing. */

function CoursesMock() {
  return (
    <ul className="space-y-2">
      {[
        { title: "Linear Algebra", dot: "bg-purple-400" },
        { title: "Organic Chemistry", dot: "bg-emerald-400" },
        { title: "World History", dot: "bg-sky-400" },
      ].map((course, index) => (
        <li
          key={course.title}
          className="flex items-center gap-3 rounded-xl border border-black/5 px-3 py-2.5 dark:border-white/10"
        >
          <PulseDot className={course.dot} delay={index * 0.4} />
          <span className="text-sm font-medium">{course.title}</span>
        </li>
      ))}
    </ul>
  );
}

function MaterialMock() {
  const still = useStill();

  return (
    <div className="rounded-xl border border-black/5 p-3 dark:border-white/10">
      <div className="flex items-center gap-2">
        <FileText className="text-muted-foreground size-4" />
        <p className="truncate text-sm font-medium">Lecture-12-slides.pdf</p>
      </div>
      <p className="text-muted-foreground mt-2 flex items-center gap-1 text-xs">
        <motion.span
          animate={still ? undefined : { scale: [1, 1.25, 1], rotate: [0, 12, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          className="inline-flex"
        >
          <Sparkles className="size-3" />
        </motion.span>
        Summary
      </p>
      <div className="mt-1.5 space-y-1.5">
        <WritingBar className="w-full" />
        <WritingBar className="w-2/3" delay={0.35} />
      </div>
    </div>
  );
}

function DeadlinesMock() {
  const still = useStill();

  return (
    <ul className="space-y-2">
      {[
        { title: "Problem set 6", due: "Tomorrow", overdue: false },
        { title: "Lab report", due: "3 days ago", overdue: true },
        { title: "Reading response", due: "Fri", overdue: false },
      ].map((item, index) => (
        <li
          key={item.title}
          className="flex items-center justify-between gap-3 rounded-xl border border-black/5 px-3 py-2.5 dark:border-white/10"
        >
          <span className="flex items-center gap-2 text-sm font-medium">
            <span
              className={cn(
                "flex size-4 items-center justify-center rounded-full border",
                item.overdue
                  ? "border-red-300"
                  : "border-emerald-300 bg-emerald-100 dark:bg-emerald-900",
              )}
            >
              {/* The ticks keep checking themselves off, one after another. */}
              {!item.overdue ? (
                <motion.span
                  animate={
                    still ? undefined : { scale: [0, 1, 1, 0], opacity: [0, 1, 1, 0] }
                  }
                  transition={{
                    duration: 4,
                    times: [0, 0.18, 0.8, 1],
                    repeat: Infinity,
                    delay: index * 0.9,
                    ease: "easeInOut",
                  }}
                  className="inline-flex"
                >
                  <Check className="size-2.5 text-emerald-700 dark:text-emerald-300" />
                </motion.span>
              ) : null}
            </span>
            {item.title}
          </span>
          <motion.span
            animate={still || !item.overdue ? undefined : { opacity: [1, 0.45, 1] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className={cn(
              "flex shrink-0 items-center gap-1 text-xs",
              item.overdue ? "text-destructive" : "text-muted-foreground",
            )}
          >
            <Clock className="size-3" />
            {item.due}
          </motion.span>
        </li>
      ))}
    </ul>
  );
}

function ChatMock() {
  return (
    <div className="space-y-2.5">
      <div className="bg-secondary text-secondary-foreground ml-auto w-fit max-w-[80%] rounded-2xl rounded-br-sm px-3 py-2 text-xs">
        What does chapter 4 say about catalysts?
      </div>
      <div className="w-fit max-w-[88%] rounded-2xl rounded-bl-sm border border-black/5 px-3 py-2 dark:border-white/10">
        <p className="text-muted-foreground mb-1.5 flex items-center gap-1.5 text-[0.7rem]">
          <Sparkles className="size-3" /> From Lecture-12-slides.pdf
          <TypingDots className="ml-1" />
        </p>
        <div className="space-y-1.5">
          <WritingBar className="w-full" duration={2.2} />
          <WritingBar className="w-4/5" delay={0.3} duration={2.2} />
        </div>
      </div>
    </div>
  );
}

function PracticeMock() {
  const still = useStill();

  return (
    <div className="rounded-xl border border-black/5 p-3 dark:border-white/10">
      <p className="text-muted-foreground text-xs">Question 3 of 10</p>
      <p className="mt-1.5 text-sm font-medium">
        A catalyst increases reaction rate by…
      </p>
      <ul className="mt-2.5 space-y-1.5">
        {[
          { text: "Raising the activation energy", correct: false },
          { text: "Lowering the activation energy", correct: true },
          { text: "Increasing the enthalpy change", correct: false },
        ].map((option) => (
          <li
            key={option.text}
            className={cn(
              "relative flex items-center gap-2 overflow-hidden rounded-lg border px-2.5 py-1.5 text-xs",
              option.correct
                ? "border-emerald-300 font-medium dark:border-emerald-800"
                : "border-black/5 dark:border-white/10",
            )}
          >
            {/* The right answer keeps lighting up, then dimming again. */}
            {option.correct ? (
              <motion.span
                aria-hidden
                className="absolute inset-0 bg-emerald-100 dark:bg-emerald-950/60"
                animate={still ? undefined : { opacity: [0, 1, 1, 0] }}
                transition={{
                  duration: 4.5,
                  times: [0, 0.25, 0.75, 1],
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ) : null}
            <span
              className={cn(
                "relative flex size-4 shrink-0 items-center justify-center rounded-full border",
                option.correct
                  ? "border-emerald-400 bg-emerald-200 dark:bg-emerald-800"
                  : "border-black/15 dark:border-white/20",
              )}
            >
              {option.correct ? (
                <Check className="size-2.5 text-emerald-800 dark:text-emerald-200" />
              ) : null}
            </span>
            <span className="relative">{option.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const MOCKS: Record<FeatureKey, () => React.ReactElement> = {
  courses: CoursesMock,
  material: MaterialMock,
  deadlines: DeadlinesMock,
  chat: ChatMock,
  practice: PracticeMock,
};

/** How long each tab holds before the showcase moves itself along. */
const DWELL_MS = 6000;

/**
 * The horizontal showcase: a row of tabs across the top, one wide panel
 * underneath, and content that slides sideways as the tabs change.
 *
 * It advances itself on a timer, so the section is never sitting still — a
 * click just takes the wheel and restarts the clock from that tab.
 */
export function FeatureShowcase() {
  const [active, setActive] = useState<FeatureKey>(FEATURES[0].key);
  // Bumping this restarts the dwell timer, so a tab you just picked gets a
  // full turn rather than the tail end of the previous one's.
  const [turn, setTurn] = useState(0);
  const still = useStill();

  const feature = FEATURES.find((item) => item.key === active) ?? FEATURES[0];
  const Mock = MOCKS[feature.key];

  useEffect(() => {
    if (still) return;
    const timer = setInterval(() => {
      setActive((current) => {
        const index = FEATURES.findIndex((item) => item.key === current);
        return FEATURES[(index + 1) % FEATURES.length].key;
      });
      setTurn((current) => current + 1);
    }, DWELL_MS);
    return () => clearInterval(timer);
  }, [still, turn]);

  const pick = useCallback((key: FeatureKey) => {
    setActive(key);
    setTurn((current) => current + 1);
  }, []);

  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      className="mx-auto w-full max-w-6xl px-6 py-14 sm:py-16"
    >
      <SectionHeading
        id="features-heading"
        eyebrow="The workspace"
        title="Five things you were doing in five apps."
      />

      {/* Tab row — wraps onto a second, centred line on phones (a sideways
          scroller cut the later tabs off with no hint there was more). */}
      <Rise delay={0.05} className="mt-8">
        <div>
          <div className="mx-auto flex flex-wrap justify-center gap-2">
            {FEATURES.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => pick(item.key)}
                aria-pressed={active === item.key}
                className={cn(
                  // `isolate` keeps the -z-10 active pill inside this button's own
                  // stacking context instead of behind the section background.
                  "relative isolate flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors",
                  active === item.key
                    ? "text-background"
                    : "text-muted-foreground hover:bg-muted",
                )}
              >
                {active === item.key ? (
                  <motion.span
                    layoutId="showcase-tab-pill"
                    className="bg-foreground absolute inset-0 -z-10 rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                ) : null}
                <item.icon className="size-3.5" />
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </Rise>

      <Rise delay={0.1} className="mt-6">
        <div className="relative">
          {/* Two tinted cards rocking behind the panel, forever. */}
          <motion.div
            aria-hidden
            className={cn("absolute inset-4 -z-10 rounded-[2rem]", feature.stack[0])}
            animate={still ? undefined : { rotate: [-2, -3.5, -2] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            aria-hidden
            className={cn("absolute inset-4 -z-20 rounded-[2rem]", feature.stack[1])}
            animate={still ? undefined : { rotate: [2, 3.5, 2] }}
            transition={{ duration: 8.5, repeat: Infinity, ease: "easeInOut" }}
          />

          <div
            className={cn(
              "grid gap-8 overflow-hidden rounded-[2rem] p-6 transition-colors duration-500 sm:grid-cols-2 sm:p-9",
              feature.tint,
            )}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={`${feature.key}-copy`}
                className="flex flex-col justify-center"
                initial={still ? false : { opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={still ? undefined : { opacity: 0, x: 24 }}
                transition={{ duration: 0.35, ease: EASE }}
              >
                <span className="bg-card/80 text-foreground/80 mb-3 inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.7rem] font-medium">
                  <feature.icon className="size-3.5" />
                  {feature.eyebrow}
                </span>
                <h3 className="text-2xl font-bold tracking-tight text-balance">
                  {feature.title}
                </h3>
                <p className="text-foreground/70 mt-3 text-sm">
                  {feature.description}
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <CtaButton href="/signup" size="md" arrow>
                    Get started
                  </CtaButton>
                  <CtaButton href="#tools" size="md" variant="secondary">
                    See the tools
                  </CtaButton>
                </div>
              </motion.div>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.div
                key={`${feature.key}-mock`}
                className="bg-card self-center rounded-2xl border border-black/5 p-4 shadow-sm dark:border-white/10"
                initial={still ? false : { opacity: 0, x: 28, scale: 0.97 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={still ? undefined : { opacity: 0, x: -28, scale: 0.97 }}
                transition={{ duration: 0.35, ease: EASE }}
              >
                <Mock />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* The dwell timer, drawn as a line sweeping left to right. */}
          <div className="bg-muted mx-auto mt-5 h-1 w-40 overflow-hidden rounded-full">
            <motion.div
              key={`${feature.key}-${turn}`}
              className="bg-foreground/40 h-full w-full origin-left rounded-full"
              initial={still ? { scaleX: 1 } : { scaleX: 0 }}
              animate={still ? undefined : { scaleX: 1 }}
              transition={{ duration: DWELL_MS / 1000, ease: "linear" }}
            />
          </div>
        </div>
      </Rise>
    </section>
  );
}
