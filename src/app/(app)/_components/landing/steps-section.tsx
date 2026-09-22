"use client";

import { motion, useInView, useScroll, useSpring } from "framer-motion";
import {
  BookOpen,
  CalendarCheck,
  Sparkles,
  UploadCloud,
  type LucideIcon,
} from "lucide-react";
import { useRef } from "react";

import {
  getTileColorClasses,
  type IconTileColor,
} from "@/components/icon-tile";

import { EASE, PulseRing, useStill } from "./motion";
import { SectionHeading } from "./ui";

const STEPS: {
  title: string;
  description: string;
  icon: LucideIcon;
  color: IconTileColor;
}[] = [
  {
    title: "Create a course",
    description:
      "Name the subject and you have a home for everything that comes with it.",
    icon: BookOpen,
    color: "purple",
  },
  {
    title: "Add your material",
    description:
      "Upload the PDFs, Word docs and slide decks you were already given, and write notes alongside them.",
    icon: UploadCloud,
    color: "blue",
  },
  {
    title: "Let the AI read it back",
    description:
      "Summarise it, quiz yourself on it, turn it into flashcards, or just ask it questions.",
    icon: Sparkles,
    color: "pink",
  },
  {
    title: "Stay ahead of deadlines",
    description:
      "Track assignments and exams, plan around them, and sync the dates to your calendar.",
    icon: CalendarCheck,
    color: "green",
  },
];

function Step({
  step,
  index,
}: {
  step: (typeof STEPS)[number];
  index: number;
}) {
  const ref = useRef<HTMLLIElement>(null);
  const still = useStill();
  const inView = useInView(ref, { once: true, margin: "-15% 0px -10% 0px" });

  return (
    <li ref={ref} className="relative">
      <motion.span
        aria-hidden
        initial={still ? false : { scale: 0.4, opacity: 0 }}
        animate={
          still ? undefined : inView ? { scale: 1, opacity: 1 } : undefined
        }
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        className={`relative flex size-12 items-center justify-center rounded-2xl shadow-sm ${getTileColorClasses(step.color)}`}
      >
        <PulseRing
          className={getTileColorClasses(step.color)}
          delay={index * 0.5}
        />
        <step.icon className="relative size-5" />
      </motion.span>

      <motion.div
        initial={still ? false : { opacity: 0, y: 20 }}
        animate={still ? undefined : inView ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.6, ease: EASE, delay: 0.08 }}
      >
        <p className="text-muted-foreground mt-4 text-xs font-medium tracking-[0.18em] uppercase">
          Step {index + 1}
        </p>
        <h3 className="mt-1.5 text-lg font-bold tracking-tight">{step.title}</h3>
        <p className="text-muted-foreground mt-1.5 text-sm">
          {step.description}
        </p>
      </motion.div>
    </li>
  );
}

/**
 * The four steps run left to right across the page rather than down it — the
 * old vertical rail reserved a 96px gutter beside every row for a 48px icon,
 * which left the whole section looking mostly empty.
 *
 * The connecting line fills as you scroll, and a dot keeps travelling along
 * it so the section is still moving once the line is full.
 */
export function StepsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const still = useStill();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 85%", "end 70%"],
  });
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className="bg-card/40 border-y py-14 sm:py-16"
    >
      <div className="mx-auto w-full max-w-6xl px-6">
        <SectionHeading
          id="how-it-works-heading"
          eyebrow="How it works"
          title="Four steps, about five minutes."
        />

        <div ref={ref} className="relative mt-12">
          {/* The rail sits level with the middle of the icon tiles and runs
              behind them; it only reads as a timeline once the steps are side
              by side, so it stays hidden while they're stacked. */}
          <span
            aria-hidden
            className="bg-border absolute top-6 right-0 left-0 hidden h-px sm:block"
          />
          <motion.span
            aria-hidden
            style={still ? undefined : { scaleX }}
            className="bg-primary/60 absolute top-6 right-0 left-0 hidden h-px origin-left sm:block"
          />
          {!still ? (
            <motion.span
              aria-hidden
              className="bg-primary absolute top-6 left-0 hidden size-2 -translate-y-1/2 rounded-full sm:block"
              animate={{ left: ["0%", "100%"], opacity: [0, 1, 1, 0] }}
              transition={{
                duration: 5,
                times: [0, 0.1, 0.9, 1],
                repeat: Infinity,
                ease: "easeInOut",
                repeatDelay: 1,
              }}
            />
          ) : null}

          <ol className="relative grid gap-10 sm:grid-cols-2 sm:gap-8 lg:grid-cols-4">
            {STEPS.map((step, index) => (
              <Step key={step.title} step={step} index={index} />
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
