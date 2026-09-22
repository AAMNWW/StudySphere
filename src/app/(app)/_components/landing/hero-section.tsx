"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  Flame,
  Sparkles,
} from "lucide-react";
import Image from "next/image";

import { Logo } from "@/components/logo";

import { DoodleUnderline } from "./doodles";
import { EASE, Floating, Parallax, Shine, WordRotator, useStill } from "./motion";
import { CtaButton } from "./ui";

const UPLOAD_WORDS = [
  "lecture slides",
  "past papers",
  "reading lists",
  "seminar notes",
  "problem sets",
];

/** Two slow-breathing tinted blooms behind the hero. Decorative only, and
 * held still for visitors who asked for reduced motion. */
function Aurora() {
  const reduce = useStill();
  const float = reduce ? undefined : { y: [0, -22, 0], scale: [1, 1.05, 1] };

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <motion.div
        animate={float}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-28 -left-24 size-[26rem] rounded-full bg-purple-200/40 blur-3xl dark:bg-purple-900/20"
      />
      <motion.div
        animate={float}
        transition={{ duration: 17, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute -top-16 right-0 size-[22rem] rounded-full bg-amber-200/40 blur-3xl dark:bg-amber-900/20"
      />
      <motion.div
        animate={float}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        className="absolute top-40 left-1/3 size-[20rem] rounded-full bg-pink-200/35 blur-3xl dark:bg-pink-900/20"
      />
    </div>
  );
}

/** The little status cards that hover around the hero photo. Each one keeps
 * bobbing on its own timing so the collage never settles. */
const FLOATERS: {
  icon: typeof Sparkles;
  title: string;
  meta: string;
  tint: string;
  position: string;
  delay: number;
}[] = [
  {
    icon: Sparkles,
    title: "Summary ready",
    meta: "Lecture-12.pdf",
    tint: "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-200",
    position: "-top-4 -left-4 sm:-left-8",
    delay: 0,
  },
  {
    icon: Clock,
    title: "Problem set 6",
    meta: "Due tomorrow",
    tint: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200",
    position: "top-1/3 -right-3 sm:-right-7",
    delay: 1.1,
  },
  {
    icon: Flame,
    title: "7 day streak",
    meta: "Keep it going",
    tint: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-200",
    position: "-bottom-5 -left-2 sm:-left-6",
    delay: 2.2,
  },
];

export function HeroSection() {
  const reduce = useStill();

  return (
    <section className="relative overflow-hidden">
      <Aurora />

      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-6 pt-10 pb-12 sm:pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:pb-20">
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <motion.span
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="mb-5 inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700 dark:bg-purple-950 dark:text-purple-200"
          >
            <motion.span
              animate={reduce ? undefined : { rotate: [0, 16, -12, 0] }}
              transition={{ duration: 2.6, repeat: Infinity, repeatDelay: 1.4 }}
            >
              <Sparkles className="size-3.5" />
            </motion.span>
            AI-powered study workspace
          </motion.span>

          <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-[3.4rem] lg:leading-[1.05]">
            <span className="block overflow-hidden pb-[0.1em]">
              <motion.span
                className="block"
                initial={reduce ? false : { y: "110%" }}
                animate={reduce ? undefined : { y: "0%" }}
                transition={{ duration: 0.8, ease: EASE }}
              >
                Your whole study life,
              </motion.span>
            </span>
            <span className="block overflow-hidden pb-[0.1em]">
              <motion.span
                className="text-primary block"
                initial={reduce ? false : { y: "110%" }}
                animate={reduce ? undefined : { y: "0%" }}
                transition={{ duration: 0.8, delay: 0.12, ease: EASE }}
              >
                in one place.
              </motion.span>
            </span>
            <DoodleUnderline className="text-primary/40 mx-auto -mt-2 h-3 w-44 lg:mx-0" />
          </h1>

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.28, ease: EASE }}
            className="text-muted-foreground mt-5 max-w-lg text-balance sm:text-lg"
          >
            Courses, notes, deadlines and documents in one workspace, with AI
            that summarises, quizzes and tutors you on the material you already
            have.
          </motion.p>

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.38, ease: EASE }}
            className="text-muted-foreground/80 mt-3 flex items-baseline gap-1.5 text-sm"
          >
            Drop in your
            <WordRotator
              words={UPLOAD_WORDS}
              className="text-foreground font-medium"
            />
          </motion.p>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.48, ease: EASE }}
            className="mt-7 flex flex-wrap items-center justify-center gap-3 lg:justify-start"
          >
            <CtaButton href="/signup" arrow>
              Get started free
            </CtaButton>
            <CtaButton href="#features" variant="secondary">
              Take the tour
            </CtaButton>
          </motion.div>

          <motion.p
            initial={reduce ? false : { opacity: 0 }}
            animate={reduce ? undefined : { opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.62 }}
            className="text-muted-foreground mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs lg:justify-start"
          >
            {["Free to use", "No credit card", "Sign in with Google"].map(
              (item) => (
                <span key={item} className="flex items-center gap-1">
                  <CheckCircle2 className="size-3.5 text-emerald-500" />
                  {item}
                </span>
              ),
            )}
          </motion.p>
        </div>

        {/* Photo card with pastel status cards bobbing around it — the
            collage keeps moving even before the first scroll. */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 36, scale: 0.96 }}
          animate={reduce ? undefined : { opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.85, delay: 0.15, ease: EASE }}
          className="relative mx-auto w-full max-w-sm lg:max-w-md"
        >
          {/* Sparkles drifting around the photo — small, slow, endless. */}
          {[
            { className: "-top-6 right-6 text-purple-400", delay: 0, size: "size-5" },
            { className: "top-1/2 -left-7 text-amber-400", delay: 1.4, size: "size-4" },
            { className: "-bottom-8 right-10 text-pink-400", delay: 2.6, size: "size-6" },
          ].map((sparkle) => (
            <motion.span
              key={sparkle.className}
              aria-hidden
              className={`pointer-events-none absolute ${sparkle.className}`}
              animate={
                reduce
                  ? undefined
                  : {
                      y: [0, -14, 0],
                      rotate: [0, 25, -10, 0],
                      opacity: [0.35, 1, 0.35],
                    }
              }
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: sparkle.delay,
              }}
            >
              <Sparkles className={sparkle.size} />
            </motion.span>
          ))}

          <Parallax distance={36}>
            <div className="bg-muted relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-black/5 shadow-xl dark:border-white/10">
              <Shine />
              <Image
                src="/photos/study-friends.jpg"
                alt="Three students smiling together on campus, carrying backpacks and notebooks"
                fill
                sizes="(min-width: 1024px) 40vw, 90vw"
                priority
                className="object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-center gap-2.5 p-4">
                <Logo className="h-8 w-auto text-white" paper="transparent" />
                <div className="leading-tight">
                  <p className="text-sm font-bold text-white">Academique</p>
                  <p className="text-xs text-white/75">Study smarter, together</p>
                </div>
              </div>
            </div>
          </Parallax>

          {FLOATERS.map(({ icon: Icon, title, meta, tint, position, delay }) => (
            <Floating
              key={title}
              delay={delay}
              distance={12}
              duration={5.5}
              className={`absolute ${position}`}
            >
              <div className="bg-card flex items-center gap-2.5 rounded-2xl border border-black/5 px-3 py-2.5 shadow-lg dark:border-white/10">
                <span
                  className={`flex size-8 shrink-0 items-center justify-center rounded-xl ${tint}`}
                >
                  <Icon className="size-4" />
                </span>
                <div className="leading-tight">
                  <p className="text-xs font-semibold whitespace-nowrap">{title}</p>
                  <p className="text-muted-foreground text-[0.7rem] whitespace-nowrap">
                    {meta}
                  </p>
                </div>
              </div>
            </Floating>
          ))}
        </motion.div>
      </div>

    </section>
  );
}
