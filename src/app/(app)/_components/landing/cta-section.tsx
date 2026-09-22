"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

import { Logo } from "@/components/logo";

import { EASE, Floating, HorizontalMarquee, Rise, Shine, useStill } from "./motion";
import { CtaButton } from "./ui";

/** Short promises for the ticker above the closing card. */
const TICKER = [
  "Free to use",
  "No credit card",
  "Unlimited courses",
  "AI summaries",
  "Chat with your PDFs",
  "Auto-built flashcards",
  "Practice quizzes",
  "Deadline tracking",
  "Calendar sync",
  "Career tools",
];

const INCLUDED = [
  "Unlimited courses",
  "Notes, documents & deadlines",
  "AI summaries, chat, quizzes & flashcards",
  "Career tools",
];

export function CtaSection() {
  const reduce = useStill();

  return (
    <section id="pricing" className="pt-6 pb-16">
      <HorizontalMarquee speed={46} reverse className="mb-10">
        {TICKER.map((item) => (
          <span
            key={item}
            className="text-muted-foreground flex items-center gap-2 text-sm font-medium whitespace-nowrap"
          >
            <Check className="text-primary size-4" />
            {item}
            <span className="text-border ml-1">•</span>
          </span>
        ))}
      </HorizontalMarquee>

      <Rise className="mx-auto w-full max-w-4xl px-6">
        <div className="bg-secondary relative overflow-hidden rounded-[2.5rem] px-6 py-14 text-center sm:px-12">
          <Shine />
          <motion.div
            aria-hidden
            animate={reduce ? undefined : { y: [0, -18, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="bg-primary/15 pointer-events-none absolute -top-24 left-1/2 size-80 -translate-x-1/2 rounded-full blur-3xl"
          />

          <motion.div
            initial={reduce ? false : { scale: 0.6, y: 20, opacity: 0 }}
            whileInView={reduce ? undefined : { scale: 1, y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ type: "spring", stiffness: 190, damping: 15 }}
            className="relative"
          >
            <Floating distance={9} duration={4.5}>
              <Logo className="mx-auto h-20 w-auto" paper="var(--secondary)" />
            </Floating>
          </motion.div>

          <h2 className="relative mt-6 text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Stop studying across ten different tools.
          </h2>
          <p className="text-secondary-foreground/70 relative mx-auto mt-4 max-w-md text-balance">
            One workspace for your courses, your material and the AI that works
            on it. Free to start, and about a minute to set up.
          </p>

          <motion.ul
            initial={reduce ? false : "hidden"}
            whileInView={reduce ? undefined : "visible"}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ staggerChildren: 0.07, delayChildren: 0.15 }}
            className="relative mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2"
          >
            {INCLUDED.map((item) => (
              <motion.li
                key={item}
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.45, ease: EASE }}
                className="text-secondary-foreground/80 flex items-center gap-1.5 text-sm"
              >
                <Check className="text-primary size-4" />
                {item}
              </motion.li>
            ))}
          </motion.ul>

          <div className="relative mt-9 flex flex-wrap items-center justify-center gap-3">
            <CtaButton href="/signup" arrow>
              Get started free
            </CtaButton>
            <CtaButton href="/login" variant="secondary">
              I already have an account
            </CtaButton>
          </div>

          <p className="text-secondary-foreground/60 relative mt-5 text-xs">
            No credit card required.
          </p>
        </div>
      </Rise>
    </section>
  );
}
