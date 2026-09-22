"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

import { Logo } from "@/components/logo";

import { EASE, useStill } from "./motion";

const NAME = "Academique";
/** How long the mark and wordmark hold before the curtain lifts. */
const HOLD_MS = 1750;

/** The brand moment before the landing page: the mark springs in, the name
 * assembles letter by letter, a hairline fills underneath, and then the whole
 * curtain lifts up off the top of the screen.
 *
 * It renders on the server too, so the very first paint is the splash rather
 * than a flash of the page behind it. Anyone who would rather skip it can
 * click, scroll or press a key. */
export function IntroSplash() {
  const still = useStill();
  const [dismissed, setDismissed] = useState(false);
  // Derived rather than stored: a still page never needs the curtain, and
  // deriving it keeps the state out of an effect.
  const visible = !dismissed && !still;

  useEffect(() => {
    if (still) return;

    const timer = setTimeout(() => setDismissed(true), HOLD_MS);
    const skip = () => setDismissed(true);
    window.addEventListener("pointerdown", skip);
    window.addEventListener("keydown", skip);
    window.addEventListener("wheel", skip, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("wheel", skip);
    };
  }, [still]);

  // Holding the page still underneath keeps the curtain from revealing a
  // half-scrolled page if the visitor flicks the wheel while it's up.
  useEffect(() => {
    if (!visible || still) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [still, visible]);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="splash"
          aria-hidden
          className="bg-background fixed inset-0 z-[70] flex flex-col items-center justify-center gap-5"
          exit={{ y: "-100%" }}
          transition={{ duration: 0.75, ease: EASE }}
        >
          {/* Soft pastel wash so the curtain carries the brand color, not
              just the logo. */}
          <motion.div
            aria-hidden
            className="bg-primary/15 pointer-events-none absolute size-[34rem] rounded-full blur-3xl"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.1, ease: EASE }}
          />

          <motion.div
            className="relative"
            initial={{ scale: 0.5, y: 18, opacity: 0, rotate: -8 }}
            animate={{ scale: 1, y: 0, opacity: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 190, damping: 14 }}
          >
            <Logo className="h-24 w-auto sm:h-28" />
          </motion.div>

          <p className="font-heading relative flex text-2xl font-bold tracking-tight sm:text-3xl">
            {NAME.split("").map((letter, index) => (
              <motion.span
                key={`${letter}-${index}`}
                initial={{ y: 16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  duration: 0.45,
                  delay: 0.3 + index * 0.045,
                  ease: EASE,
                }}
              >
                {letter}
              </motion.span>
            ))}
          </p>

          <div className="bg-muted relative h-1 w-32 overflow-hidden rounded-full">
            <motion.div
              className="bg-primary h-full w-full origin-left rounded-full"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: HOLD_MS / 1000, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
