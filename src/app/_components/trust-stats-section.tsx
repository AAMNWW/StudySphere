"use client";

import { motion } from "framer-motion";
import Image from "next/image";

import { DoodleScribbleCircle } from "./doodle-accents";
import { Reveal } from "./reveal";

const POP = {
  hidden: { opacity: 0, scale: 0.85, y: 16 },
  visible: { opacity: 1, scale: 1, y: 0 },
};

export function TrustStatsSection() {
  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-16">
      <div className="grid items-center gap-12 sm:grid-cols-2">
        <Reveal>
          <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Everything a student&apos;s browser tab graveyard used to hold.
          </h2>
          <p className="text-muted-foreground mt-4 max-w-sm text-sm">
            One app instead of ten, built around what actually happens when
            you sit down to study.
          </p>
        </Reveal>

        <motion.div
          className="relative mx-auto h-72 w-full max-w-sm sm:h-80"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          transition={{ staggerChildren: 0.12, delayChildren: 0.05 }}
        >
          <motion.div
            variants={POP}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="absolute top-0 left-0 h-40 w-44 overflow-hidden rounded-3xl shadow-md sm:h-44 sm:w-48"
          >
            <Image
              src="/photos/study-library.jpg"
              alt="A student studying alone at a library desk"
              fill
              sizes="190px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute inset-x-0 top-3 left-4">
              <span className="relative inline-block w-fit">
                <span className="text-3xl font-bold tracking-tight text-white sm:text-4xl">7</span>
                <DoodleScribbleCircle className="text-white/50 pointer-events-none absolute -inset-x-3 -inset-y-2 h-[calc(100%+1rem)] w-[calc(100%+1.5rem)]" />
              </span>
            </div>
            <p className="absolute inset-x-0 bottom-3 px-4 text-xs font-medium text-white/85">
              AI-powered study tools, in one place
            </p>
          </motion.div>

          <motion.div
            variants={POP}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.08 }}
            className="absolute top-4 right-0 h-32 w-40 overflow-hidden rounded-3xl shadow-md sm:h-36 sm:w-44"
          >
            <Image
              src="/photos/study-outdoor.jpg"
              alt="Students studying together outside on campus"
              fill
              sizes="180px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4">
              <p className="text-lg font-bold text-white">$0</p>
              <p className="text-xs text-white/80">Free to start, always</p>
            </div>
          </motion.div>

          <motion.div
            variants={POP}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.16 }}
            className="absolute bottom-0 left-10 w-44 overflow-hidden rounded-3xl shadow-md sm:left-12 sm:w-48"
          >
            <div className="relative aspect-[4/3]">
              <Image
                src="/photos/study-cafe.jpg"
                alt="Friends studying together at a cafe"
                fill
                sizes="190px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />
            </div>
            <div className="absolute inset-x-0 bottom-0 p-3">
              <p className="text-lg font-bold text-white">5 min</p>
              <p className="text-xs text-white/80">To your first AI summary</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
