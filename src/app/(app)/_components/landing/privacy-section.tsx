"use client";

import { motion } from "framer-motion";
import { Lock, Server, Sparkles, UserCheck, type LucideIcon } from "lucide-react";

import { IconTile, type IconTileColor } from "@/components/icon-tile";

import { Floating, Shine, useStill } from "./motion";
import { SectionHeading } from "./ui";

/** The three things we will actually stand behind. */
const PROMISES: {
  title: string;
  description: string;
  icon: LucideIcon;
  color: IconTileColor;
}[] = [
  {
    title: "Scoped to your account",
    description:
      "Every course, note, assignment, document, chat, quiz and flashcard set you create is tied to your account and isn't visible to anyone else.",
    icon: UserCheck,
    color: "purple",
  },
  {
    title: "Uploads stay on the server",
    description:
      "Files you upload are stored on the server and aren't shared with any third party by default.",
    icon: Server,
    color: "blue",
  },
  {
    title: "AI only sees what you point it at",
    description:
      "A document's content is only sent for processing when you use an AI feature on it: summarising, chatting, or generating a quiz or flashcards. Never on upload.",
    icon: Sparkles,
    color: "pink",
  },
];

/** A tick that draws itself the first time the card is reached, rather than
 * a checkmark glyph that was simply always there. */
function DrawnCheck({ delay = 0 }: { delay?: number }) {
  const still = useStill();

  return (
    <span className="flex size-7 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="size-4 text-emerald-600 dark:text-emerald-300"
        aria-hidden
      >
        <motion.path
          d="M5 12.5 L10 17.5 L19 7"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={still ? false : { pathLength: 0 }}
          whileInView={still ? undefined : { pathLength: 1 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.55, delay, ease: "easeOut" }}
        />
      </svg>
    </span>
  );
}

function PromiseCard({
  promise,
  index,
}: {
  promise: (typeof PROMISES)[number];
  index: number;
}) {
  const still = useStill();
  const Icon = promise.icon;

  return (
    <motion.div
      initial={still ? false : { opacity: 0, y: 24 }}
      whileInView={still ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="bg-card relative h-full overflow-hidden rounded-3xl border border-black/5 p-6 shadow-sm dark:border-white/10"
    >
      <Shine />
      {/* Oversized index sunk into the card, so the three read as a numbered
          set rather than three identical tiles. */}
      <span
        aria-hidden
        className="text-foreground/[0.05] pointer-events-none absolute -right-1 -bottom-6 text-[6rem] leading-none font-bold tabular-nums"
      >
        {String(index + 1).padStart(2, "0")}
      </span>

      <div className="relative flex items-start justify-between gap-3">
        <Floating delay={index * 0.5} distance={6} duration={5}>
          <IconTile color={promise.color} size="lg">
            <Icon className="size-6" />
          </IconTile>
        </Floating>
        <DrawnCheck delay={0.25 + index * 0.1} />
      </div>

      <p className="relative mt-5 font-medium">{promise.title}</p>
      <p className="text-muted-foreground relative mt-2 text-sm">
        {promise.description}
      </p>
    </motion.div>
  );
}

/** The caveat gets its own shape on purpose: a taped-up note, not a fourth
 * identical promise card. Three things we stand behind, one thing we admit,
 * and the layout says which is which before you read a word. */
function CaveatNote() {
  const still = useStill();

  return (
    <motion.div
      initial={still ? false : { opacity: 0, y: 24 }}
      whileInView={still ? undefined : { opacity: 1, y: 0, rotate: -0.6 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.6 }}
      className="relative"
    >
      <motion.div
        animate={still ? undefined : { rotate: [-0.6, 0.5, -0.6] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="relative rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50 p-6 sm:p-7 dark:border-amber-800 dark:bg-amber-950/40"
      >
        {/* A strip of tape across the top edge. */}
        <span
          aria-hidden
          className="absolute -top-3.5 left-1/2 h-7 w-28 -translate-x-1/2 -rotate-2 rounded-sm bg-amber-200/80 shadow-sm dark:bg-amber-900/70"
        />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Floating distance={5} duration={4.5} className="shrink-0">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-amber-200 text-amber-800 dark:bg-amber-900 dark:text-amber-100">
              <Lock className="size-5" />
            </span>
          </Floating>
          <div>
            <p className="font-medium">Still early, and saying so</p>
            <p className="text-muted-foreground mt-1.5 text-sm">
              There&apos;s no self-serve data export or account deletion yet,
              and no encryption-at-rest or compliance certification to point
              to. If you need either, reach out first.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function PrivacySection() {
  return (
    <section
      id="privacy"
      aria-labelledby="privacy-heading"
      className="mx-auto w-full max-w-6xl px-6 py-14 sm:py-16"
    >
      <SectionHeading
        id="privacy-heading"
        eyebrow="Your data"
        title="No bigger claims than we can back up."
        description="Three things we stand behind, and one we are not going to pretend about."
      />

      <div className="mt-10 grid gap-4 lg:grid-cols-3">
        {PROMISES.map((promise, index) => (
          <PromiseCard key={promise.title} promise={promise} index={index} />
        ))}
      </div>

      <div className="mt-8">
        <CaveatNote />
      </div>
    </section>
  );
}
