"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/** A hairline that fills across the very top of the window as the visitor
 * scrolls the landing page — sits above the sticky site header (z-40) so it
 * stays visible the whole way down. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 28,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="bg-primary fixed inset-x-0 top-0 z-50 h-[3px] origin-left"
    />
  );
}
