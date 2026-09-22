"use client";

import { motion } from "framer-motion";
import {
  Briefcase,
  FileText,
  Mail,
  MessageCircle,
  Mic,
  Target,
  Wand2,
  type LucideIcon,
} from "lucide-react";

import {
  getTileColorClasses,
  type IconTileColor,
} from "@/components/icon-tile";
import { cn } from "@/lib/utils";

import { HorizontalMarquee, Rise, Shine, useStill } from "./motion";
import { CtaButton, SectionHeading } from "./ui";

const CAREER_TOOLS: {
  title: string;
  description: string;
  step: string;
  icon: LucideIcon;
  color: IconTileColor;
}[] = [
  {
    title: "Resume Maker",
    description: "Build it section by section, with AI help on the wording.",
    step: "Write it",
    icon: Wand2,
    color: "yellow",
  },
  {
    title: "Resumes",
    description: "Keep every version you've tailored, and export a clean PDF.",
    step: "Keep it",
    icon: FileText,
    color: "blue",
  },
  {
    title: "ATS Check",
    description: "See how it reads against a specific job description.",
    step: "Test it",
    icon: Target,
    color: "green",
  },
  {
    title: "Cover Letter",
    description: "Draft one from your resume and the role you're chasing.",
    step: "Pitch it",
    icon: Mail,
    color: "pink",
  },
  {
    title: "Job Tracker",
    description: "Every application, its stage, and what you owe it next.",
    step: "Track it",
    icon: Briefcase,
    color: "purple",
  },
  {
    title: "Mock Interviews",
    description: "Practise against real questions and get feedback back.",
    step: "Rehearse it",
    icon: Mic,
    color: "red",
  },
  {
    title: "Career Chat",
    description: "Ask about roles, applications and next steps, in context.",
    step: "Ask about it",
    icon: MessageCircle,
    color: "pink",
  },
];

function CareerCard({
  tool,
  index,
}: {
  tool: (typeof CAREER_TOOLS)[number];
  index: number;
}) {
  const still = useStill();

  return (
    <motion.div
      animate={still ? undefined : { y: [0, -7, 0] }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
        delay: index * 0.4,
      }}
      className="bg-card relative w-60 shrink-0 overflow-hidden rounded-2xl border border-black/5 p-5 shadow-sm sm:w-64 dark:border-white/10"
    >
      <Shine />
      <div className="relative flex items-center justify-between">
        <span
          className={cn(
            "flex size-10 items-center justify-center rounded-xl",
            getTileColorClasses(tool.color),
          )}
        >
          <tool.icon className="size-5" />
        </span>
        <span className="text-muted-foreground text-[0.65rem] font-medium tracking-[0.16em] uppercase">
          {tool.step}
        </span>
      </div>
      <p className="relative mt-4 font-medium">{tool.title}</p>
      <p className="text-muted-foreground relative mt-1.5 text-sm">
        {tool.description}
      </p>
    </motion.div>
  );
}

/**
 * The career pitch, laid out sideways: the seven tools ride past in one
 * continuous horizontal rail instead of stacking down the page — a change of
 * axis after a long vertical run, and the rail never stops moving.
 */
export function CareerSection() {
  return (
    <section className="bg-secondary/60 overflow-hidden py-14 sm:py-16">
      <div className="mx-auto w-full max-w-6xl px-6">
        <SectionHeading
          align="start"
          eyebrow="After the coursework"
          title="The degree isn't the finish line."
          description="Write the resume, test it against the posting, send the letter, track the reply, rehearse the interview. Seven tools, one account, no new login."
        />

        <Rise delay={0.1} className="mt-7">
          <CtaButton href="/signup" arrow>
            Start your resume
          </CtaButton>
        </Rise>
      </div>

      {/* Full-bleed rail: the cards run edge to edge, sliding left forever. */}
      <div className="mt-10">
        <HorizontalMarquee speed={52}>
          {CAREER_TOOLS.map((tool, index) => (
            <CareerCard key={tool.title} tool={tool} index={index} />
          ))}
        </HorizontalMarquee>
      </div>
    </section>
  );
}
