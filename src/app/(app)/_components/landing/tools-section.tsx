"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  CalendarDays,
  Layers3,
  ListChecks,
  MessageCircle,
  Sparkles,
  SquareStack,
  Target,
  type LucideIcon,
} from "lucide-react";

import { IconTile, type IconTileColor } from "@/components/icon-tile";

import { Floating, Stagger, StaggerItem, useStill } from "./motion";
import { SectionHeading } from "./ui";

const TOOLS: {
  title: string;
  description: string;
  icon: LucideIcon;
  color: IconTileColor;
}[] = [
  {
    title: "AI summaries",
    description:
      "A plain-language summary of any document you upload, in a couple of clicks.",
    icon: Sparkles,
    color: "pink",
  },
  {
    title: "Chat with your material",
    description:
      "Ask a document a question and get an answer grounded in what it actually says.",
    icon: MessageCircle,
    color: "blue",
  },
  {
    title: "Quiz generator",
    description:
      "Turn a reading into a multiple-choice quiz and find the gaps before the exam does.",
    icon: SquareStack,
    color: "green",
  },
  {
    title: "Flashcards",
    description:
      "Auto-built flashcard sets from your own course material, ready to review.",
    icon: Layers3,
    color: "yellow",
  },
  {
    title: "Study planner",
    description:
      "Turn a course's deadlines into a day-by-day plan you can actually follow.",
    icon: CalendarDays,
    color: "purple",
  },
  {
    title: "Topic tracking",
    description:
      "Break a course into topics and see what you've covered and what you haven't.",
    icon: Target,
    color: "gray",
  },
  {
    title: "Assignments & exams",
    description:
      "Due dates, completion, automatic overdue flags, and exam dates in one list.",
    icon: ListChecks,
    color: "green",
  },
  {
    title: "Progress analytics",
    description:
      "Grades, streaks and study history, so progress is something you can see.",
    icon: BarChart3,
    color: "purple",
  },
];

export function ToolsSection() {
  const reduce = useStill();

  return (
    <section
      id="tools"
      aria-labelledby="tools-heading"
      className="mx-auto w-full max-w-6xl px-6 py-14 sm:py-16"
    >
      <SectionHeading
        id="tools-heading"
        eyebrow="Study tools"
        title="Every tool works on the material you already uploaded."
        description="Nothing here asks you to paste your notes into yet another app. Point a tool at a course, and it uses what's in it."
      />

      <Stagger
        className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        stagger={0.06}
      >
        {TOOLS.map(({ title, description, icon: Icon, color }, index) => (
          <StaggerItem key={title} className="h-full">
            <motion.div
              whileHover={reduce ? undefined : { y: -6 }}
              // A shallow wave across the grid: each card is a beat behind the
              // one before it, so the whole section keeps drifting.
              animate={reduce ? undefined : { y: [0, -5, 0] }}
              transition={{
                y: {
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.25,
                },
                default: { type: "spring", stiffness: 340, damping: 22 },
              }}
              className="bg-card h-full rounded-2xl border border-black/5 p-5 shadow-sm dark:border-white/10"
            >
              {/* Only the tile bobs, not the whole card — eight cards moving
                  at once would be noise rather than life. */}
              <Floating delay={index * 0.35} distance={6} duration={5}>
                <IconTile color={color}>
                  <Icon className="size-5" />
                </IconTile>
              </Floating>
              <p className="mt-4 font-medium">{title}</p>
              <p className="text-muted-foreground mt-1.5 text-sm">
                {description}
              </p>
            </motion.div>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
